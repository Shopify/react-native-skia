#pragma once

#include <memory>
#include <string>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"
#include "jsi/ViewProperty.h"
#include "rnskia/RNSkViewRegistry.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 The handle of a Skia view, handed to JS by SkiaViewApi.makeViewHandle for
 the view's id: what JS hands the view (the recorder of a <Canvas>, a
 picture) goes through it, never by id (see ViewRegistry). Disposed when the
 canvas unmounts; what it still holds then dies with it.
 */
class JsiSkViewHandle
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkViewHandle, RNSkViewInfo> {
public:
  static constexpr const char *CLASS_NAME = "ViewHandle";

  JsiSkViewHandle(std::shared_ptr<RNSkPlatformContext> context,
                  std::shared_ptr<RNSkViewInfo> info)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkViewHandle, RNSkViewInfo>(
            std::move(context), std::move(info)) {}

  JSI_HOST_FUNCTION(setPicture) {
    return setProperty(runtime, "picture", arguments, count);
  }

  JSI_HOST_FUNCTION(setRecorder) {
    return setProperty(runtime, "recorder", arguments, count);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "setPicture",
                      &JsiSkViewHandle::setPicture);
    installHostMethod(runtime, prototype, "setRecorder",
                      &JsiSkViewHandle::setRecorder);
  }

  size_t getMemoryPressure() override { return 1024; }

private:
  jsi::Value setProperty(jsi::Runtime &runtime, const char *name,
                         const jsi::Value *arguments, size_t count) {
    if (count != 1) {
      throw jsi::JSError(runtime, std::string(name) + ": expected 1 argument");
    }
    getObject()->setProperty(name, RNJsi::ViewProperty(runtime, arguments[0]));
    return jsi::Value::undefined();
  }
};

} // namespace RNSkia
