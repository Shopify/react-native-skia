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

/**
 * Inverse of skColorSpaceFromString. Compares the SkColorSpace against
 * the known set of identifiers and returns the matching string, or an
 * empty string if no match (callers should surface that as
 * undefined/null on the JS side).
 */
inline std::string skColorSpaceToString(const SkColorSpace *cs) {
  if (cs == nullptr) {
    return "";
  }
  static const sk_sp<SkColorSpace> kSrgb = SkColorSpace::MakeSRGB();
  static const sk_sp<SkColorSpace> kSrgbLinear = SkColorSpace::MakeSRGBLinear();
  static const sk_sp<SkColorSpace> kP3 = SkColorSpace::MakeRGB(
      SkNamedTransferFn::kSRGB, SkNamedGamut::kDisplayP3);
  static const sk_sp<SkColorSpace> kP3Linear = SkColorSpace::MakeRGB(
      SkNamedTransferFn::kLinear, SkNamedGamut::kDisplayP3);
  static const sk_sp<SkColorSpace> kRec2020 = SkColorSpace::MakeRGB(
      SkNamedTransferFn::kRec2020, SkNamedGamut::kRec2020);
  static const sk_sp<SkColorSpace> kRec2020Linear = SkColorSpace::MakeRGB(
      SkNamedTransferFn::kLinear, SkNamedGamut::kRec2020);
  static const sk_sp<SkColorSpace> kRec2020Hlg = SkColorSpace::MakeRGB(
      SkNamedTransferFn::kHLG, SkNamedGamut::kRec2020);
  static const sk_sp<SkColorSpace> kRec2020Pq = SkColorSpace::MakeRGB(
      SkNamedTransferFn::kPQ, SkNamedGamut::kRec2020);

  if (SkColorSpace::Equals(cs, kSrgb.get())) return "srgb";
  if (SkColorSpace::Equals(cs, kSrgbLinear.get())) return "srgb-linear";
  if (SkColorSpace::Equals(cs, kP3.get())) return "display-p3";
  if (SkColorSpace::Equals(cs, kP3Linear.get())) return "display-p3-linear";
  if (SkColorSpace::Equals(cs, kRec2020.get())) return "rec2020";
  if (SkColorSpace::Equals(cs, kRec2020Linear.get())) return "rec2020-linear";
  if (SkColorSpace::Equals(cs, kRec2020Hlg.get())) return "rec2020-hlg";
  if (SkColorSpace::Equals(cs, kRec2020Pq.get())) return "rec2020-pq";
  return "";
}

} // namespace RNSkia
