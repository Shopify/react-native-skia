#pragma once

#include <map>

#include "JsiSkHostObjects.h"
#include <SkFont.h>
#include <SkTypeface.h>
#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkTypeface : public JsiSkWrappingSkPtrHostObject<SkTypeface> {
public:
  JsiSkTypeface(RNSkPlatformContext *context, const sk_sp<SkTypeface> typeface)
      : JsiSkWrappingSkPtrHostObject(context, typeface) {
    // Install functions
    installProperty(
        "bold",
        [this](jsi::Runtime &) -> jsi::Value {
          return jsi::Value(getObject()->isBold());
        },
        [](jsi::Runtime &, const jsi::Value &value) {
          // Not possible to set this one
        });

    installProperty(
        "italic",
        [this](jsi::Runtime &) -> jsi::Value {
          return jsi::Value(getObject()->isItalic());
        },
        [](jsi::Runtime &, const jsi::Value &value) {
          // Not possible to set this one
        });
  };

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkTypeface> fromValue(jsi::Runtime &runtime,
                                     const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkTypeface>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkTypeface
   * wrapper
   * @param context Platform Context
   * @return A function for creating a new host object wrapper for the
   * SkTypeface class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      if (count == 2) {
        return jsi::Object::createFromHostObject(
            runtime,
            std::make_shared<JsiSkTypeface>(
                context,
                SkTypeface::MakeFromName(
                    arguments[0].asString(runtime).utf8(runtime).c_str(),
                    getFontStyleFromNumber(arguments[1].asNumber()))));
      } else {
        // Return the newly constructed object
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkTypeface>(
                         context, SkTypeface::MakeDefault()));
      }
    };
  }

private:
  static SkFontStyle getFontStyleFromNumber(int fontStyle) {
    switch (fontStyle) {
    case 0:
      return SkFontStyle::Normal();
    case 1:
      return SkFontStyle::Bold();
    case 2:
      return SkFontStyle::Italic();
    case 3:
      return SkFontStyle::BoldItalic();
    default:
      return SkFontStyle::Normal();
    };
  }
};

} // namespace RNSkia
