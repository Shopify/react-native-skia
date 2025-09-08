#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "RNSkLog.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFont.h"
#include "include/core/SkFontTypes.h"
#include "include/core/SkTypeface.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkTypeface : public JsiSkWrappingSkPtrHostObject<SkTypeface> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkTypeface, Typeface)
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTypeface, getGlyphIDs),
                       JSI_EXPORT_FUNC(JsiSkTypeface, dispose))

  JsiSkTypeface(std::shared_ptr<RNSkPlatformContext> context,
                sk_sp<SkTypeface> typeface)
      : JsiSkWrappingSkPtrHostObject(std::move(context), std::move(typeface)) {}

  JSI_HOST_FUNCTION(getGlyphIDs) {
    auto str = arguments[0].asString(runtime).utf8(runtime);
    int numGlyphIDs =
        count > 1 && !arguments[1].isNull() && !arguments[1].isUndefined()
            ? static_cast<int>(arguments[1].asNumber())
            : getObject()->textToGlyphs(str.c_str(), str.length(),
                                        SkTextEncoding::kUTF8,
                                        SkSpan<SkGlyphID>(nullptr, 0));
    std::vector<SkGlyphID> glyphIDs;
    glyphIDs.resize(numGlyphIDs);
    getObject()->textToGlyphs(
        str.c_str(), str.length(), SkTextEncoding::kUTF8,
        SkSpan(static_cast<SkGlyphID *>(glyphIDs.data()), numGlyphIDs));
    auto jsiGlyphIDs = jsi::Array(runtime, numGlyphIDs);
    for (int i = 0; i < numGlyphIDs; i++) {
      jsiGlyphIDs.setValueAtIndex(runtime, i,
                                  jsi::Value(static_cast<int>(glyphIDs[i])));
    }
    return jsiGlyphIDs;
  }

  size_t getMemoryPressure() const override {
    auto typeface = getObject();
    if (!typeface) {
      return 0;
    }

    // Typefaces can be quite large as they contain font data
    // Since SkTypeface doesn't provide a direct memory usage method,
    // estimate based on glyph count (typically ranges from 64KB to several MB)
    int glyphCount = typeface->countGlyphs();
    return glyphCount > 0
               ? glyphCount * 64
               : 65536; // 64 bytes per glyph estimate, or 64KB minimum
  }

  /**
   Returns the jsi object from a host object of this type
  */
  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            sk_sp<SkTypeface> tf) {
    auto hostObjectInstance =
        std::make_shared<JsiSkTypeface>(context, std::move(tf));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, context);
  }
};

} // namespace RNSkia
