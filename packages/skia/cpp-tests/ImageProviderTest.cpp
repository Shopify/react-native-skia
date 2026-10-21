// Host-side check of RNSkia::ImageProvider, built against the Skia headers
// only (see run.sh). The Skia symbols the header references but this check
// never reaches are stubbed below.

#include <cstdio>
#include <cstdlib>
#include <cstring>

#include "include/private/SkLog.h"
#include "rnskia/RNImageProvider.h"

void SkLog(SkLogPriority, const char[], ...) {}
void sk_abort_no_print() { std::abort(); }
void SkTiledImageUtils::GetImageKeyValues(const SkImage *, uint32_t *values) {
  std::memset(values, 0,
              sizeof(uint32_t) * SkTiledImageUtils::kNumImageKeyValues);
}

static int fail(const char *message) {
  std::fprintf(stderr, "FAIL: %s\n", message);
  return 1;
}

int main() {
  int uploads = 0;
  // The recorder that receives the provider must be its only owner: a
  // second reference would keep the provider alive after the recorder is
  // gone.
  auto provider = RNSkia::ImageProvider::Make(
      [&uploads](const SkImage *, bool) -> sk_sp<SkImage> {
        uploads++;
        return nullptr;
      });
  if (!provider->unique()) {
    return fail("ImageProvider::Make() returns a provider with more than one "
                "reference");
  }
  // The cache is shared by every provider, and starts empty.
  if (RNSkia::ImageProvider::count() != 0 ||
      RNSkia::ImageProvider::bytesUsed() != 0) {
    return fail("the shared cache is not empty at start");
  }
  // A miss uploads through the uploader. An upload that failed is not
  // cached: the next draw tries again.
  int dummy = 0;
  const auto *image = reinterpret_cast<const SkImage *>(&dummy);
  if (provider->findOrCreate(nullptr, image, {false}) != nullptr ||
      uploads != 1) {
    return fail("a miss does not upload through the uploader");
  }
  if (provider->findOrCreate(nullptr, image, {false}) != nullptr ||
      uploads != 2) {
    return fail("a failed upload is cached");
  }
  if (RNSkia::ImageProvider::count() != 0) {
    return fail("a failed upload left an entry in the cache");
  }
  std::printf("ImageProviderTest: passed\n");
  return 0;
}
