#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkHostObjects.h"
#include "JsiSkNativeObjects.h"
#include "utils/RNSkLog.h"
#include <jsi/jsi.h>

#include "JsiSkPaint.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"
#include "JsiSkTypeface.h"

#include "rnskia/RNWindowContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFont.h"
#include "include/core/SkFontMetrics.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkiaContext
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkiaContext, WindowContext> {
public:
  static constexpr const char *CLASS_NAME = "SkiaContext";

  JSI_HOST_FUNCTION(getSurface) {
    auto surface = getObject()->getSurface();
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkSurface>(
                                      getContext(), std::move(surface)));
  }

  JSI_HOST_FUNCTION(present) {
    getObject()->present();
    return jsi::Value::undefined();
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "getSurface",
                      &JsiSkiaContext::getSurface);
    installHostMethod(runtime, prototype, "present", &JsiSkiaContext::present);
  }

  JsiSkiaContext(std::shared_ptr<RNSkPlatformContext> context,
                 std::shared_ptr<WindowContext> ctx)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkiaContext, WindowContext>(
            std::move(context), std::move(ctx)) {}

  size_t getMemoryPressure() override { return 10 * 1024 * 1024; }

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
      jsi::BigInt pointer = arguments[0].asBigInt(runtime);
      const uintptr_t nativeBufferPointer = pointer.asUint64(runtime);
      void *surface = reinterpret_cast<void *>(nativeBufferPointer);
      auto width = static_cast<int>(arguments[1].asNumber());
      auto height = static_cast<int>(arguments[2].asNumber());
      if (surface == nullptr) {
        throw std::runtime_error("Surface is null");
      }
      auto result =
          context->makeContextFromNativeSurface(surface, width, height);
      if (result == nullptr) {
        throw std::runtime_error(
            "Couldn't create a Skia context from the native surface");
      }
      // Return the newly constructed object
      return makeJsiObject(runtime, std::make_shared<JsiSkiaContext>(
                                        context, std::move(result)));
    };
  }
};

} // namespace RNSkia
