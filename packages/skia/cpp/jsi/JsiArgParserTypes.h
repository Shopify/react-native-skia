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

} // namespace RNSkia

// Macro to make it easy to define custom parsers in implementation files
// For shared_ptr types
#define JSI_ARG_PARSER_SHARED_PTR(SkType, JsiType)                             \
  namespace RNSkia {                                                           \
  template <> struct ArgParserTraits<SkType> {                                 \
    static std::shared_ptr<SkType> parseSharedPtr(jsi::Runtime &runtime,       \
                                                  const jsi::Value &value) {   \
      return JsiType::fromValue(runtime, value);                               \
    }                                                                          \
  };                                                                           \
  }

// For sk_sp types
#define JSI_ARG_PARSER_SK_SP(SkType, JsiType)                                  \
  namespace RNSkia {                                                           \
  template <> struct ArgParserTraits<SkType> {                                 \
    static sk_sp<SkType> parseSkSp(jsi::Runtime &runtime,                      \
                                   const jsi::Value &value) {                  \
      return JsiType::fromValue(runtime, value);                               \
    }                                                                          \
  };                                                                           \
  }

// For SkColor (special case - it's a typedef, not a class)
#define JSI_ARG_PARSER_SKCOLOR(JsiColorType)                                   \
  namespace RNSkia {                                                           \
  template <>                                                                  \
  inline SkColor ArgParser::parse<SkColor>(const jsi::Value &value) {         \
    return JsiColorType::fromValue(_runtime, value);                           \
  }                                                                            \
  }
