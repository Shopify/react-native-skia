#pragma once

#include <memory>
#include <string>
#include <utility>

#include <jsi/jsi.h>

#include "RNSkGraphiteTarget.h"
#include "RNSkPlatformContext.h"
#include "RNSkView.h"
#include "RNSkViewRegistry.h"
#include "api/JsiSkGraphiteContext.h"
#include "api/JsiSkNativeObjects.h"
#include "api/JsiSkViewHandle.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkJsiViewApi : public JsiSkNativeObject<RNSkJsiViewApi> {
public:
  static constexpr const char *CLASS_NAME = "ViewApi";

  /**
   Returns the id for a view about to mount, unique for the life of the
   process (see ViewRegistry::allocateId).
   */
  JSI_HOST_FUNCTION(allocateNativeId) {
    return jsi::Value(
        static_cast<double>(ViewRegistry::getInstance().allocateId()));
  }

  /**
   Returns the handle of the view of an id (see JsiSkViewHandle): (nativeId).
   Made by the canvas when it mounts; what it hands over waits in the
   registry entry until the platform binds the view to the id.
   */
  JSI_HOST_FUNCTION(makeViewHandle) {
    if (count != 1 || !arguments[0].isNumber()) {
      throw jsi::JSError(runtime, "makeViewHandle: expected (nativeId)");
    }
    auto nativeId = static_cast<size_t>(arguments[0].asNumber());
    auto info = ViewRegistry::getInstance().acquire(nativeId);
    return makeJsiObject(runtime, std::make_shared<JsiSkViewHandle>(
                                      _platformContext, std::move(info)));
  }

  JSI_HOST_FUNCTION(requestRedraw) {
    if (count != 1) {
      _platformContext->raiseError(
          std::string("requestRedraw: Expected 1 arguments, got " +
                      std::to_string(count) + "."));

      return jsi::Value::undefined();
    }

    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "requestRedraw: First argument must be a number");

      return jsi::Value::undefined();
    }

    // find Skia View
    int nativeId = arguments[0].asNumber();
    auto view = ViewRegistry::getInstance().getView(nativeId);
    if (view != nullptr) {
      view->requestRedraw();
    }
    return jsi::Value::undefined();
  }

  /**
   Reads the given shared values into the recording held for the view and
   schedules a redraw: (nativeId, recorderId, values). Called from the
   Reanimated mapper on every frame, by id: the worklet captures no native
   object. Ignored for an id with no entry (see RNSkViewInfo::applyUpdates).
   */
  JSI_HOST_FUNCTION(applyUpdates) {
    if (count != 3 || !arguments[0].isNumber() || !arguments[1].isNumber() ||
        !arguments[2].isObject() ||
        !arguments[2].asObject(runtime).isArray(runtime)) {
      _platformContext->raiseError(
          "applyUpdates: expected (nativeId: number, recorderId: number, "
          "values: SharedValue[])");
      return jsi::Value::undefined();
    }
    int nativeId = arguments[0].asNumber();
    auto recorderId = arguments[1].asNumber();
    auto values = arguments[2].asObject(runtime).asArray(runtime);
    if (auto info = ViewRegistry::getInstance().find(nativeId)) {
      info->applyUpdates(runtime, recorderId, values);
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(makeImageSnapshot) {
    if (count < 1) {
      _platformContext->raiseError(
          std::string("makeImageSnapshot: Expected at least 1 argument, got " +
                      std::to_string(count) + "."));
      return jsi::Value::undefined();
    }

    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "makeImageSnapshot: First argument must be a number");
      return jsi::Value::undefined();
    }

    // find Skia view
    int nativeId = arguments[0].asNumber();
    sk_sp<SkImage> image;
    std::shared_ptr<RNSkView> view =
        ViewRegistry::getInstance().getView(nativeId);
    if (view != nullptr) {
      if (count > 1 && !arguments[1].isUndefined() && !arguments[1].isNull()) {
        auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
        image = view->makeImageSnapshot(rect.get());
      } else {
        image = view->makeImageSnapshot(nullptr);
      }
      if (image == nullptr) {
        throw jsi::JSError(runtime,
                           "Could not create image from current surface.");
        return jsi::Value::undefined();
      }
      return makeJsiObject(
          runtime, std::make_shared<JsiSkImage>(_platformContext, image));
    }
    throw jsi::JSError(runtime, "No Skia View currently available.");
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(size) {
    if (count != 1) {
      _platformContext->raiseError(std::string(
          "size: Expected 1 argument, got " + std::to_string(count) + "."));
      return jsi::Value::undefined();
    }

    if (!arguments[0].isNumber()) {
      _platformContext->raiseError("size: First argument must be a number");
      return jsi::Value::undefined();
    }

    // find Skia View
    int nativeId = arguments[0].asNumber();
    std::shared_ptr<RNSkView> view =
        ViewRegistry::getInstance().getView(nativeId);
    if (view != nullptr) {
      auto pixelDensity = _platformContext->getPixelDensity();
      auto sizeObj = jsi::Object(runtime);
      sizeObj.setProperty(runtime, "width",
                          view->getScaledWidth() / pixelDensity);
      sizeObj.setProperty(runtime, "height",
                          view->getScaledHeight() / pixelDensity);
      return sizeObj;
    }

    // Return default size if view not found
    auto sizeObj = jsi::Object(runtime);
    sizeObj.setProperty(runtime, "width", 0);
    sizeObj.setProperty(runtime, "height", 0);
    return sizeObj;
  }

  /**
   Returns the recording side of a view: (nativeId, width, height, opaque,
   highBitDepth), the size in points as laid out and the props the surface
   format follows from. The view may not exist yet; the context binds to it
   by id when it does, and the registry owns the target in between, so a
   frame submitted before then is kept whether or not JS keeps the context.
   */
  JSI_HOST_FUNCTION(makeGraphiteContext) {
    if (count < 3 || !arguments[0].isNumber() || !arguments[1].isNumber() ||
        !arguments[2].isNumber()) {
      throw jsi::JSError(runtime, "makeGraphiteContext: expected (nativeId, "
                                  "width, height, opaque, highBitDepth)");
    }
    auto nativeId = static_cast<size_t>(arguments[0].asNumber());
    auto width = static_cast<float>(arguments[1].asNumber());
    auto height = static_cast<float>(arguments[2].asNumber());
    bool opaque = count > 3 && arguments[3].isBool() && arguments[3].getBool();
    bool highBitDepth =
        count > 4 && arguments[4].isBool() && arguments[4].getBool();
    auto target = RNSkGraphiteTargetRegistry::getInstance().getOrCreate(
        nativeId, _platformContext);
    target->setLayout(width, height, opaque, highBitDepth);
    return makeJsiObject(runtime, std::make_shared<JsiSkGraphiteContext>(
                                      _platformContext, std::move(target)));
  }

  /**
   Retires the target made for a view id from the JS side: (nativeId). Called
   when the view component unmounts; a no-op once a view bound to the id,
   whose teardown retires it. A context JS still holds keeps the target for
   the view to bind to, as React's StrictMode runs this cleanup right after
   mount (see RNSkGraphiteTargetRegistry).
   */
  JSI_HOST_FUNCTION(destroyGraphiteContext) {
    if (count < 1 || !arguments[0].isNumber()) {
      throw jsi::JSError(runtime,
                         "destroyGraphiteContext: expected (nativeId)");
    }
    auto nativeId = static_cast<size_t>(arguments[0].asNumber());
    RNSkGraphiteTargetRegistry::getInstance().removeIfUnbound(nativeId);
    return jsi::Value::undefined();
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "allocateNativeId",
                      &RNSkJsiViewApi::allocateNativeId);
    installHostMethod(runtime, prototype, "makeViewHandle",
                      &RNSkJsiViewApi::makeViewHandle);
    installHostMethod(runtime, prototype, "requestRedraw",
                      &RNSkJsiViewApi::requestRedraw);
    installHostMethod(runtime, prototype, "applyUpdates",
                      &RNSkJsiViewApi::applyUpdates);

    installHostMethod(runtime, prototype, "makeImageSnapshot",
                      &RNSkJsiViewApi::makeImageSnapshot);
    installHostMethod(runtime, prototype, "size", &RNSkJsiViewApi::size);
    installHostMethod(runtime, prototype, "makeGraphiteContext",
                      &RNSkJsiViewApi::makeGraphiteContext);
    installHostMethod(runtime, prototype, "destroyGraphiteContext",
                      &RNSkJsiViewApi::destroyGraphiteContext);
  }

  /**
   * Constructor
   * @param platformContext Platform context
   */
  explicit RNSkJsiViewApi(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiSkNativeObject<RNSkJsiViewApi>(platformContext),
        _platformContext(platformContext) {}

private:
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};
} // namespace RNSkia
