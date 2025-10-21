#pragma once

#include "JsiArgParser.h"

// Forward declarations for all JsiSk* wrapper classes
// These will be included by files that use ArgParser
namespace RNSkia {

// Import common forward declarations
class JsiSkPaint;
class JsiSkImage;
class JsiSkRect;
class JsiSkRRect;
class JsiSkPath;
class JsiSkPoint;
class JsiSkMatrix;
class JsiSkFont;
class JsiSkShader;
class JsiSkImageFilter;
class JsiSkColorFilter;
class JsiSkMaskFilter;
class JsiSkPathEffect;
class JsiSkPicture;
class JsiSkTextBlob;
class JsiSkVertices;
class JsiSkSVG;
class JsiSkData;
class JsiSkTypeface;
class JsiSkRSXform;

// Template specializations for shared_ptr types
// These delegate to the appropriate JsiSk*::fromValue methods

#define DEFINE_SHARED_PTR_PARSER(SkType, JsiType)                              \
  template <>                                                                  \
  inline std::shared_ptr<SkType> ArgParser::parseSharedPtr<SkType>(            \
      const jsi::Value &value) {                                               \
    return JsiType::fromValue(_runtime, value);                                \
  }

// Define parsers for common shared_ptr types
// Note: These will only work if the corresponding JsiSk* header is included
// Users should include the specific JsiSk*.h headers they need

// Common Skia types with JsiSk wrappers
// Uncomment and add specific types as needed in the implementation files

} // namespace RNSkia

// Macro to make it easy to define custom parsers in implementation files
#define JSI_ARG_PARSER_SHARED_PTR(SkType, JsiType)                             \
  namespace RNSkia {                                                           \
  template <>                                                                  \
  inline std::shared_ptr<SkType>                                               \
  ArgParser::parseSharedPtr<SkType>(const jsi::Value &value) {                 \
    return JsiType::fromValue(_runtime, value);                                \
  }                                                                            \
  }

#define JSI_ARG_PARSER_SK_SP(SkType, JsiType)                                  \
  namespace RNSkia {                                                           \
  template <>                                                                  \
  inline sk_sp<SkType> ArgParser::parseSkSp<SkType>(const jsi::Value &value) { \
    return JsiType::fromValue(_runtime, value);                                \
  }                                                                            \
  }
