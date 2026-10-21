#pragma once

#include <chrono>
#include <cstdint>
#include <cstring>
#include <functional>
#include <list>
#include <mutex>
#include <unordered_map>
#include <utility>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/core/SkTiledImageUtils.h"
#include "include/gpu/graphite/Image.h"
#include "include/gpu/graphite/ImageProvider.h"
#include "include/gpu/graphite/Recorder.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 * Uploads the CPU images (raster or encoded) the recorders draw, and keeps
 * the textures for the next frames, in one cache for the whole process.
 *
 * Graphite only draws GPU images: it hands any other image to the provider of
 * the recorder, and drops the draw when the provider returns nothing. This is
 * the implicit path; the explicit one is SkImage::makeTextureImage()
 * (DawnContext::MakeTextureImage), and the provider uploads the same way: on
 * an upload recorder of the calling thread, submitted right away, rather
 * than recorded into the frame that first draws the image. The texture is
 * then complete on the GPU before any recording that samples it is inserted,
 * in whatever order the recordings are inserted. That is what lets every
 * recorder share the one cache: the render thread pool records the frames of
 * every view on the recorders of its threads, and the views present them in
 * an order of their own, so an upload riding in one view's frame could not
 * be relied on by another's. An image drawn by many views is uploaded once.
 *
 * The cache is bounded by bytes, least recently used first out, and an entry
 * not drawn for a while is released. It is cleared when the GPU device is
 * replaced (see invalidateAll): its textures belong to the lost device. The
 * lock is held for the lookups only, never for an upload: decoding and
 * uploading an image can take a while, and the threads upload in parallel.
 */
class ImageProvider : public skgpu::graphite::ImageProvider {
public:
  /**
   Uploads a CPU image and submits the upload, so that any recorder can draw
   the GPU image it returns; nullptr when the upload failed (see
   DawnContext::MakeTextureImage).
   */
  using Uploader =
      std::function<sk_sp<SkImage>(const SkImage *image, bool mipmapped)>;

  /** Bytes of textures the cache keeps before releasing the oldest. */
  static constexpr size_t kDefaultBudgetInBytes = 128 * 1024 * 1024;
  /** An entry not drawn for that long is released. */
  static constexpr std::chrono::seconds kMaxUnusedAge{10};

  explicit ImageProvider(Uploader uploader) : _uploader(std::move(uploader)) {}

  static sk_sp<ImageProvider> Make(Uploader uploader) {
    return sk_make_sp<ImageProvider>(std::move(uploader));
  }

  /**
   Releases every texture the cache holds. Called when the GPU device is
   replaced (see DawnContext): the textures were made on the lost device,
   which the new one refuses. Any thread.
   */
  static void invalidateAll() { cache().clear(); }

  sk_sp<SkImage>
  findOrCreate(skgpu::graphite::Recorder *recorder, const SkImage *image,
               SkImage::RequiredProperties requiredProps) override {
    auto &shared = cache();
    const bool mipmapped = requiredProps.fMipmapped;
    if (auto hit = shared.find(image, mipmapped)) {
      return hit;
    }
    // Outside the lock (see the class comment).
    auto texture = _uploader(image, mipmapped);
    if (texture == nullptr) {
      return nullptr;
    }
    return shared.insert(image, mipmapped, std::move(texture));
  }

  /** Bytes of textures held, for tests and diagnostics. */
  static size_t bytesUsed() { return cache().bytesUsed(); }

  /** Number of textures held, for tests and diagnostics. */
  static size_t count() { return cache().count(); }

private:
  using Clock = std::chrono::steady_clock;

  // The content of the image (the generation id of its pixels, or the id
  // of its generator, and the subset), not its address: two images sharing
  // pixels share a texture, and a freed image's address cannot alias.
  class Key {
  public:
    Key(const SkImage *image, bool mipmapped) {
      SkTiledImageUtils::GetImageKeyValues(image, _values);
      _values[kNumValues - 1] = mipmapped ? 1 : 0;
    }

    bool operator==(const Key &other) const {
      return std::memcmp(_values, other._values, sizeof(_values)) == 0;
    }

    size_t hash() const {
      size_t h = 0;
      for (auto value : _values) {
        h = h * 31 + value;
      }
      return h;
    }

  private:
    static constexpr int kNumValues = SkTiledImageUtils::kNumImageKeyValues + 1;
    uint32_t _values[kNumValues];
  };

  struct KeyHash {
    size_t operator()(const Key &key) const { return key.hash(); }
  };

  struct Entry {
    Key key;
    sk_sp<SkImage> texture;
    size_t bytes;
    Clock::time_point lastUsed;
  };

  /** The cache every provider shares. Any thread. */
  class Cache {
  public:
    explicit Cache(size_t budgetInBytes) : _budget(budgetInBytes) {}

    /**
     The texture of the image, if held, now the most recently used; the
     entries unused for too long are released first.
     */
    sk_sp<SkImage> find(const SkImage *image, bool mipmapped) {
      const auto now = Clock::now();
      std::vector<sk_sp<SkImage>> released;
      std::lock_guard<std::mutex> lock(_mutex);
      releaseUnusedLocked(now, released);
      // A mipmapped texture also serves a draw without mipmaps.
      if (auto *hit = findLocked(Key(image, /* mipmapped= */ true), now)) {
        return *hit;
      }
      if (!mipmapped) {
        if (auto *hit = findLocked(Key(image, /* mipmapped= */ false), now)) {
          return *hit;
        }
      }
      return nullptr;
    }

    /**
     Keeps the texture and returns it, unless another thread uploaded the
     same image meanwhile: that one is kept and returned, and this one
     released. The newest entry stays even when it alone exceeds the budget:
     it is drawn this frame, and dropping it would upload it again every
     frame.
     */
    sk_sp<SkImage> insert(const SkImage *image, bool mipmapped,
                          sk_sp<SkImage> texture) {
      const auto now = Clock::now();
      const Key key(image, mipmapped);
      const size_t bytes = texture->textureSize();
      // The textures evicted (and the one that lost the race) are released
      // outside the lock.
      std::vector<sk_sp<SkImage>> released;
      std::lock_guard<std::mutex> lock(_mutex);
      if (auto *hit = findLocked(key, now)) {
        released.push_back(std::move(texture));
        return *hit;
      }
      _entries.push_front(Entry{key, texture, bytes, now});
      _index.insert_or_assign(key, _entries.begin());
      _bytes += bytes;
      while (_bytes > _budget && _entries.size() > 1) {
        eraseLocked(std::prev(_entries.end()), released);
      }
      return texture;
    }

    void clear() {
      List entries;
      {
        std::lock_guard<std::mutex> lock(_mutex);
        entries.swap(_entries);
        _index.clear();
        _bytes = 0;
      }
      // Released outside the lock.
    }

    size_t bytesUsed() {
      std::lock_guard<std::mutex> lock(_mutex);
      return _bytes;
    }

    size_t count() {
      std::lock_guard<std::mutex> lock(_mutex);
      return _entries.size();
    }

  private:
    // Most recently used first.
    using List = std::list<Entry>;

    sk_sp<SkImage> *findLocked(const Key &key, Clock::time_point now) {
      auto it = _index.find(key);
      if (it == _index.end()) {
        return nullptr;
      }
      _entries.splice(_entries.begin(), _entries, it->second);
      it->second->lastUsed = now;
      return &it->second->texture;
    }

    // Entries are ordered by last use: the unused ones are at the back. Only
    // runs on a lookup, so a cache nobody draws CPU images from keeps its
    // entries until the next one.
    void releaseUnusedLocked(Clock::time_point now,
                             std::vector<sk_sp<SkImage>> &released) {
      while (!_entries.empty() &&
             now - _entries.back().lastUsed > kMaxUnusedAge) {
        eraseLocked(std::prev(_entries.end()), released);
      }
    }

    void eraseLocked(List::iterator it, std::vector<sk_sp<SkImage>> &released) {
      _bytes -= it->bytes;
      _index.erase(it->key);
      released.push_back(std::move(it->texture));
      _entries.erase(it);
    }

    std::mutex _mutex;
    size_t _budget;
    size_t _bytes = 0;
    List _entries;
    std::unordered_map<Key, List::iterator, KeyHash> _index;
  };

  static Cache &cache() {
    // Never destroyed: a recorder may draw during process teardown.
    static auto *instance = new Cache(kDefaultBudgetInBytes);
    return *instance;
  }

  Uploader _uploader;
};

} // namespace RNSkia
