#pragma once

#include <atomic>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <list>
#include <unordered_map>
#include <utility>

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
 * Uploads the CPU images (raster or encoded) a recorder draws, and keeps the
 * textures for the next frames.
 *
 * Graphite only draws GPU images: it hands any other image to the provider of
 * the recorder, and drops the draw when the provider returns nothing. This is
 * the implicit path; the explicit one is SkImage::makeTextureImage()
 * (DawnContext::MakeTextureImage), whose result any recorder can draw.
 *
 * One provider per recorder, so one cache per view (each view records with a
 * recorder of its own) and one per thread for the thread-local recorders
 * (offscreen surfaces). An image drawn by several canvases is therefore
 * uploaded by each of them: sharing a texture across recorders is what
 * makeTextureImage() is for. In exchange the provider needs no lock: a
 * recorder records on one thread at a time, and so does its provider. The
 * upload is recorded into the recording that first draws the image, which
 * orders it before every use by the same recorder.
 *
 * The cache is bounded by bytes, least recently used first out, and an
 * entry not drawn for a while is released. Everything is released with the
 * recorder, when its view goes away.
 */
class ImageProvider : public skgpu::graphite::ImageProvider {
public:
  /** Bytes of textures a provider keeps before releasing the oldest. */
  static constexpr size_t kDefaultBudgetInBytes = 64 * 1024 * 1024;
  /** An entry not drawn for that long is released. */
  static constexpr std::chrono::seconds kMaxUnusedAge{10};

  explicit ImageProvider(size_t budgetInBytes = kDefaultBudgetInBytes)
      : _budget(budgetInBytes), _epoch(invalidationEpoch().load()) {}

  static sk_sp<ImageProvider> Make() { return sk_make_sp<ImageProvider>(); }

  /**
   Clears the cache of every provider before its next lookup. Called when a
   recording is rejected by Graphite or dropped without being replayed: the
   uploads it carried never ran, and the textures a cache holds for them were
   never written. Rare, so the whole cache goes rather than tracking which
   entries came from which recording. Any thread.
   */
  static void invalidateAll() { invalidationEpoch().fetch_add(1); }

  sk_sp<SkImage>
  findOrCreate(skgpu::graphite::Recorder *recorder, const SkImage *image,
               SkImage::RequiredProperties requiredProps) override {
    const auto now = Clock::now();
    const auto epoch = invalidationEpoch().load();
    if (epoch != _epoch) {
      _epoch = epoch;
      clear();
    } else {
      releaseUnused(now);
    }

    // A mipmapped texture also serves a draw without mipmaps.
    if (auto *hit = find(Key(image, /* mipmapped= */ true), now)) {
      return *hit;
    }
    if (!requiredProps.fMipmapped) {
      if (auto *hit = find(Key(image, /* mipmapped= */ false), now)) {
        return *hit;
      }
    }

    auto texture = SkImages::TextureFromImage(recorder, image, requiredProps);
    if (texture == nullptr) {
      return nullptr;
    }
    insert(Key(image, requiredProps.fMipmapped), texture, now);
    return texture;
  }

  /** Bytes of textures held, for tests and diagnostics. */
  size_t bytesUsed() const { return _bytes; }

  /** Number of textures held, for tests and diagnostics. */
  size_t count() const { return _entries.size(); }

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

  // Most recently used first.
  using List = std::list<Entry>;

  static std::atomic<uint32_t> &invalidationEpoch() {
    static std::atomic<uint32_t> epoch{0};
    return epoch;
  }

  sk_sp<SkImage> *find(const Key &key, Clock::time_point now) {
    auto it = _index.find(key);
    if (it == _index.end()) {
      return nullptr;
    }
    _entries.splice(_entries.begin(), _entries, it->second);
    it->second->lastUsed = now;
    return &it->second->texture;
  }

  void insert(const Key &key, sk_sp<SkImage> texture, Clock::time_point now) {
    const size_t bytes = texture->textureSize();
    _entries.push_front(Entry{key, std::move(texture), bytes, now});
    _index.insert_or_assign(key, _entries.begin());
    _bytes += bytes;
    // The newest entry stays even when it alone exceeds the budget: it is
    // drawn this frame, and dropping it would upload it again every frame.
    while (_bytes > _budget && _entries.size() > 1) {
      erase(std::prev(_entries.end()));
    }
  }

  // Entries are ordered by last use: the unused ones are at the back. Only
  // runs on a lookup, so a recorder that stops drawing CPU images keeps its
  // entries until the next one, or until it goes away.
  void releaseUnused(Clock::time_point now) {
    while (!_entries.empty() &&
           now - _entries.back().lastUsed > kMaxUnusedAge) {
      erase(std::prev(_entries.end()));
    }
  }

  void erase(List::iterator it) {
    _bytes -= it->bytes;
    _index.erase(it->key);
    _entries.erase(it);
  }

  void clear() {
    _entries.clear();
    _index.clear();
    _bytes = 0;
  }

  size_t _budget;
  size_t _bytes = 0;
  uint32_t _epoch;
  List _entries;
  std::unordered_map<Key, List::iterator, KeyHash> _index;
};

} // namespace RNSkia
