#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkColorSpace.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 * Maps a JS-side color space identifier to an SkColorSpace.
 * The accepted identifiers mirror those exported from
 * `src/skia/types/Surface/SurfaceFactory.ts` (`ColorSpace` constant).
 *
 * Returns nullptr for an unknown or empty identifier, which Skia
 * interprets as the device color space (no tagging).
 */
inline sk_sp<SkColorSpace> skColorSpaceFromString(const std::string &name) {
  if (name.empty() || name == "srgb") {
    return SkColorSpace::MakeSRGB();
  }
  if (name == "srgb-linear") {
    return SkColorSpace::MakeSRGBLinear();
  }
  if (name == "display-p3") {
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kSRGB,
                                 SkNamedGamut::kDisplayP3);
  }
  if (name == "display-p3-linear") {
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kLinear,
                                 SkNamedGamut::kDisplayP3);
  }
  if (name == "rec2020") {
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kRec2020,
                                 SkNamedGamut::kRec2020);
  }
  if (name == "rec2020-linear") {
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kLinear,
                                 SkNamedGamut::kRec2020);
  }
  if (name == "rec2020-hlg") {
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kHLG,
                                 SkNamedGamut::kRec2020);
  }
  if (name == "rec2020-pq") {
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kPQ,
                                 SkNamedGamut::kRec2020);
  }
  return nullptr;
}

} // namespace RNSkia
