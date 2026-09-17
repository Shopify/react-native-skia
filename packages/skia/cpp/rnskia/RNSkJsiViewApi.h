#pragma once

#include <functional>
#include <memory>
#include <mutex>
#include <shared_mutex>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

#include "RNSkPlatformContext.h"
#include "RNSkView.h"
#include "api/JsiSkImage.h"
#include "api/JsiSkNativeObjects.h"
#include "api/JsiSkPicture.h"
#include "api/JsiSkRect.h"
#include "jsi/JsiPromises.h"
#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

struct RNSkViewInfo {
  std::shared_ptr<RNSkView> view;
  // A picture set from JS before the native view exists (or while it is
  // detached) is parked here and applied when a view is (re)attached.
  sk_sp<SkPicture> pendingPicture;
  bool hasPendingPicture = false;

  void setPicture(sk_sp<SkPicture> picture) {
    if (view != nullptr) {
      view->setPicture(std::move(picture));
    } else {
      pendingPicture = std::move(picture);
      hasPendingPicture = true;
    }
  }

  void attachView(size_t nativeId, std::shared_ptr<RNSkView> newView) {
    view = std::move(newView);
    view->setNativeId(nativeId);
    if (hasPendingPicture) {
      view->setPicture(std::move(pendingPicture));
      pendingPicture = nullptr;
      hasPendingPicture = false;
    }
  }
};

class ViewRegistry {
public:
  static ViewRegistry &getInstance() {
    static ViewRegistry instance;
    return instance;
  }

  ViewRegistry(const ViewRegistry &) = delete;
  ViewRegistry &operator=(const ViewRegistry &) = delete;

  void removeViewInfo(size_t id) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _registry.erase(id);
    // Remember that this id was explicitly unregistered. Property updates
    // can arrive after unregistration (e.g. a Reanimated worklet setting the
    // picture racing with unmount); without a tombstone they would recreate
    // the entry and its pending picture (which retains every image it draws)
    // would stay in this global registry forever.
    _unregistered.insert(id);
  }

  // Execute a function while holding the registry lock.
  // When `revive` is true (registration paths), a previously unregistered id
  // becomes valid again; otherwise calls for unregistered ids receive a
  // transient info object that is not stored in the registry.
  template <typename F>
  auto withViewInfo(size_t id, F &&func, bool revive = false)
      -> decltype(func(std::shared_ptr<RNSkViewInfo>())) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    if (revive) {
      _unregistered.erase(id);
    }
    auto it = _registry.find(id);
    std::shared_ptr<RNSkViewInfo> info;
    if (it != _registry.end()) {
      info = it->second;
    } else {
      info = std::make_shared<RNSkViewInfo>();
      if (_unregistered.find(id) == _unregistered.end()) {
        _registry[id] = info;
      }
    }
    return func(info);
  }

  // Read-only lookup: never creates a registry entry.
  std::shared_ptr<RNSkView> getView(size_t id) {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    auto it = _registry.find(id);
    return it != _registry.end() ? it->second->view : nullptr;
  }

  void clear() {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _registry.clear();
    _unregistered.clear();
  }

private:
  ViewRegistry() = default;
  mutable std::shared_mutex _mutex;
  std::unordered_map<size_t, std::shared_ptr<RNSkViewInfo>> _registry;
  std::unordered_set<size_t> _unregistered;
};

class RNSkJsiViewApi : public JsiSkNativeObject<RNSkJsiViewApi> {
public:
  static constexpr const char *CLASS_NAME = "ViewApi";

  /**
   Sets the picture drawn by the view with the given id. The picture is stored
   alongside the id so that it survives the view being created later or
   detached and re-attached. `name` is kept for API compatibility with the JS
   side and must be "picture"; the value is an SkPicture, or null/undefined
   to clear the view.
   */
  JSI_HOST_FUNCTION(setJsiProperty) {
    if (count != 3) {
      _platformContext->raiseError(
          std::string("setJsiProperty: Expected 3 arguments, got " +
                      std::to_string(count) + "."));
      return jsi::Value::undefined();
    }

    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "setJsiProperty: First argument must be a number");
      return jsi::Value::undefined();
    }

    if (!arguments[1].isString() ||
        arguments[1].asString(runtime).utf8(runtime) != "picture") {
      _platformContext->raiseError("setJsiProperty: Second argument must be "
                                   "the property name \"picture\".");
      return jsi::Value::undefined();
    }

    sk_sp<SkPicture> picture = nullptr;
    if (!arguments[2].isNull() && !arguments[2].isUndefined()) {
      auto jsiPicture = tryGetJsiObject<JsiSkPicture>(runtime, arguments[2]);
      if (jsiPicture == nullptr) {
        _platformContext->raiseError(
            "setJsiProperty: Third argument must be an SkPicture or null.");
        return jsi::Value::undefined();
      }
      picture = jsiPicture->getObject();
    }

    auto nativeId = arguments[0].asNumber();

    // Safely execute operations while holding the registry lock
    ViewRegistry::getInstance().withViewInfo(
        nativeId, [&](std::shared_ptr<RNSkViewInfo> info) {
          info->setPicture(std::move(picture));
          return nullptr; // Return type for template deduction
        });

    return jsi::Value::undefined();
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

  JSI_HOST_FUNCTION(makeImageSnapshotAsync) {
    if (count < 1) {
      _platformContext->raiseError(std::string(
          "makeImageSnapshotAsync: Expected at least 1 argument, got " +
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
    std::shared_ptr<RNSkView> view =
        ViewRegistry::getInstance().getView(nativeId);
    auto context = _platformContext;
    auto bounds =
        count > 1 && !arguments[1].isUndefined() && !arguments[1].isNull()
            ? JsiSkRect::fromValue(runtime, arguments[1])
            : nullptr;
    return RNJsi::JsiPromises::createPromiseAsJSIValue(
        runtime, [context = std::move(context), view, bounds](
                     jsi::Runtime &runtime,
                     std::shared_ptr<RNJsi::JsiPromises::Promise> promise) {
          context->runOnMainThread([&runtime, view = std::move(view),
                                    promise = std::move(promise),
                                    context = std::move(context), bounds]() {
            auto image = view->makeImageSnapshot(
                bounds == nullptr ? nullptr : bounds.get());
            context->runOnJavascriptThread(
                [&runtime, context = std::move(context),
                 promise = std::move(promise), image = std::move(image)]() {
                  if (image == nullptr) {
                    promise->reject("Failed to make snapshot from view.");
                    return;
                  }
                  promise->resolve(makeJsiObject(
                      runtime, std::make_shared<JsiSkImage>(std::move(context),
                                                            std::move(image))));
                });
          });
        });
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

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "setJsiProperty",
                      &RNSkJsiViewApi::setJsiProperty);
    installHostMethod(runtime, prototype, "requestRedraw",
                      &RNSkJsiViewApi::requestRedraw);
    installHostMethod(runtime, prototype, "makeImageSnapshotAsync",
                      &RNSkJsiViewApi::makeImageSnapshotAsync);
    installHostMethod(runtime, prototype, "makeImageSnapshot",
                      &RNSkJsiViewApi::makeImageSnapshot);
    installHostMethod(runtime, prototype, "size", &RNSkJsiViewApi::size);
  }

  /**
   * Constructor
   * @param platformContext Platform context
   */
  explicit RNSkJsiViewApi(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiSkNativeObject<RNSkJsiViewApi>(platformContext),
        _platformContext(platformContext) {}

  /**
   Call to remove all draw view infos
   */
  void unregisterAll() { ViewRegistry::getInstance().clear(); }

  /**
   * Registers a skia view
   * @param nativeId Id of view to register
   * @param view View to register
   */
  void registerSkiaView(size_t nativeId, std::shared_ptr<RNSkView> view) {
    ViewRegistry::getInstance().withViewInfo(
        nativeId,
        [&](std::shared_ptr<RNSkViewInfo> info) {
          info->attachView(nativeId, std::move(view));
          return nullptr;
        },
        /* revive= */ true);
  }

  /**
   * Unregisters a Skia draw view
   * @param nativeId View id
   */
  void unregisterSkiaView(size_t nativeId) {
    ViewRegistry::getInstance().removeViewInfo(nativeId);
  }

  /**
   Sets a skia draw view for the given id. This function can be used
   to mark that an underlying SkiaView is not available (it could be
   removed due to ex. a transition). The view can be set to a nullptr
   or a valid view, effectively toggling the view's availability.
   */
  void setSkiaView(size_t nativeId, std::shared_ptr<RNSkView> view) {
    ViewRegistry::getInstance().withViewInfo(
        nativeId,
        [&](std::shared_ptr<RNSkViewInfo> info) {
          if (view != nullptr) {
            info->attachView(nativeId, std::move(view));
          } else {
            info->view = nullptr;
          }
          return nullptr;
        },
        /* revive= */ view != nullptr);
  }

private:
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};
} // namespace RNSkia
