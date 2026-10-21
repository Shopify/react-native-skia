// Host-side check of RNSkia::ImageProvider, built against the Skia headers
// only (see run.sh). The Skia symbols the header references but this check
// never reaches are stubbed below.

#include <cstdio>
#include <cstdlib>

#include "include/private/SkLog.h"
#include "rnskia/RNImageProvider.h"

void SkLog(SkLogPriority, const char[], ...) {}
void sk_abort_no_print() { std::abort(); }
void SkTiledImageUtils::GetImageKeyValues(const SkImage *, uint32_t *) {}
sk_sp<SkImage> SkImages::TextureFromImage(skgpu::graphite::Recorder *,
                                          const SkImage *,
                                          SkImage::RequiredProperties) {
  return nullptr;
}

int main() {
  // The recorder that receives the provider must be its only owner: a
  // second reference keeps the provider, and the images it caches, alive
  // after the recorder is gone.
  auto provider = RNSkia::ImageProvider::Make();
  if (!provider->unique()) {
    std::fprintf(stderr, "FAIL: ImageProvider::Make() returns a provider with "
                         "more than one reference\n");
    return 1;
  }
  std::printf("ImageProviderTest: passed\n");
  return 0;
}
