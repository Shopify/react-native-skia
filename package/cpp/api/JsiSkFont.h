#pragma once

#include <map>

#include "JsiSkHostObjects.h"
#include "JsiSkPaint.h"
#include "JsiSkRect.h"
#include "JsiSkTypeface.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkFont.h>
#include <SkFontMetrics.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkFont : public JsiSkWrappingSharedPtrHostObject<SkFont> {
public:

  // TODO: declare in JsiSkWrappingSkPtrHostObject via extra template parameter?
  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "Font");
  }

  JSI_PROPERTY_GET(size) { return static_cast<double>(getObject()->getSize()); }
  JSI_PROPERTY_SET(size) { getObject()->setSize(value.asNumber()); }

  JSI_HOST_FUNCTION(measureText) {
    auto textVal = arguments[0].asString(runtime).utf8(runtime);
    auto text = textVal.c_str();
    SkRect rect;
    std::shared_ptr<SkPaint> paint = nullptr;
    // Check if a paint argument was provided
    if (count == 2) {
      paint = JsiSkPaint::fromValue(runtime, arguments[1]);
    }
    getObject()->measureText(text, strlen(text), SkTextEncoding::kUTF8, &rect,
                             paint.get());
    rect.setXYWH(0, 0, rect.width(), rect.height());
    return JsiSkRect::toValue(runtime, getContext(), rect);
  }

  JSI_HOST_FUNCTION(getMetrics) {
    SkFontMetrics fm;
    getObject()->getMetrics(&fm);
    auto metrics = jsi::Object(runtime);
    metrics.setProperty(runtime, "ascent",  fm.fAscent);
    metrics.setProperty(runtime, "descent", fm.fDescent);
    metrics.setProperty(runtime, "leading", fm.fLeading);
    if (!(fm.fFlags & SkFontMetrics::kBoundsInvalid_Flag)) {
      const float rect[] = {
              fm.fXMin, fm.fTop, fm.fXMax, fm.fBottom
      };
      auto bounds = SkRect::MakeLTRB(fm.fXMin,fm.fTop, fm.fXMax, fm.fBottom );
      auto jsiBounds = JsiSkRect::toValue(runtime, getContext(), bounds);
      metrics.setProperty(runtime, "bounds",  jsiBounds);
    }
    return metrics;
  }

  JSI_HOST_FUNCTION(getGlyphIDs) {
    auto str = arguments[0].asString(runtime).utf8(runtime);
    auto numGlyphIDs = count > 1 && !arguments[1].isNull() && !arguments[1].isUndefined()
            ? arguments[1].asNumber() : str.length();
    int bytesPerGlyph = 2;
    auto glyphIDs = static_cast<SkGlyphID*>(malloc(numGlyphIDs * bytesPerGlyph));
    getObject()->textToGlyphs(str.c_str(), str.length(), SkTextEncoding::kUTF8,
                               glyphIDs, numGlyphIDs);
    auto jsiGlyphIDs = jsi::Array(runtime, numGlyphIDs);
    for (int i = 0; i < numGlyphIDs; i++) {
      jsiGlyphIDs.setValueAtIndex(runtime, i, jsi::Value(static_cast<int>(glyphIDs[i])));
    }
    return jsiGlyphIDs;
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkFont, size), JSI_EXPORT_PROP_GET(JsiSkFont, __typename__))
  JSI_EXPORT_PROPERTY_SETTERS(JSI_EXPORT_PROP_SET(JsiSkFont, size))
  JSI_EXPORT_FUNCTIONS(
    JSI_EXPORT_FUNC(JsiSkFont, measureText),
    JSI_EXPORT_FUNC(JsiSkFont, getMetrics),
    JSI_EXPORT_FUNC(JsiSkFont, getGlyphIDs)
  )

  JsiSkFont(std::shared_ptr<RNSkPlatformContext> context, const SkFont &font)
      : JsiSkWrappingSharedPtrHostObject(context,
                                         std::make_shared<SkFont>(font)){};

  /**
    Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkFont> fromValue(jsi::Runtime &runtime,
                                           const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkFont>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkFont
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the SkFont
   * class
   */
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      // Handle arguments
      if (count == 2) {
        auto typeface = JsiSkTypeface::fromValue(runtime, arguments[0]);
        auto size = arguments[1].asNumber();
        return jsi::Object::createFromHostObject(
            runtime,
            std::make_shared<JsiSkFont>(context, SkFont(typeface, size)));
      } else if (count == 1) {
        auto typeface = JsiSkTypeface::fromValue(runtime, arguments[0]);
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkFont>(context, SkFont(typeface)));
      } else {
        // Return the newly constructed object
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkFont>(context, SkFont()));
      }
    };
  }
};

} // namespace RNSkia
