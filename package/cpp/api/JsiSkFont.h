#pragma once

#include <map>

#include "JsiSkHostObjects.h"
#include "JsiSkPaint.h"
#include "JsiSkRect.h"
#include "JsiSkTypeface.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkFont.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkFont : public JsiSkWrappingSharedPtrHostObject<SkFont> {
public:
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

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkFont, size))
  JSI_EXPORT_PROPERTY_SETTERS(JSI_EXPORT_PROP_SET(JsiSkFont, size))
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFont, measureText))

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
