#include "RNSkManager.h"

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "RNSkJsiViewApi.h"
#include "RNSkPictureView.h"
#include "RNSkView.h"
#include "api/JsiSkApi.h"
#include "api/JsiSkPicture.h"
#include "api/recorder/DrawingCtx.h"
#include "api/recorder/JsiRecorder.h"
#include "api/recorder/RNRecorder.h"
#include "jsi/ViewProperty.h"

namespace RNSkia {
namespace jsi = facebook::jsi;

RNSkManager::RNSkManager(
    jsi::Runtime *jsRuntime,
    std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
    std::shared_ptr<RNSkPlatformContext> platformContext)
    : _jsRuntime(jsRuntime), _platformContext(platformContext),
      _jsCallInvoker(jsCallInvoker),
      _viewApi(std::make_shared<RNSkJsiViewApi>(platformContext)) {
  // Install bindings
  installBindings();
}

RNSkManager::~RNSkManager() {
  // Free up any references
  _viewApi = nullptr;
  _jsRuntime = nullptr;
  _platformContext = nullptr;
  _jsCallInvoker = nullptr;
}

void RNSkManager::registerSkiaView(size_t nativeId,
                                   std::shared_ptr<RNSkView> view) {
  _viewApi->registerSkiaView(nativeId, std::move(view));
}

void RNSkManager::unregisterSkiaView(size_t nativeId) {
  _viewApi->unregisterSkiaView(nativeId);
}

void RNSkManager::setSkiaView(size_t nativeId, std::shared_ptr<RNSkView> view) {
  _viewApi->setSkiaView(nativeId, std::move(view));
}

void RNSkManager::installBindings() {
  // Create the API objects and install it on the global object in the
  // provided runtime.
  auto skiaApi = std::make_shared<JsiSkApi>(_platformContext);
  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaApi", makeJsiObject(*_jsRuntime, std::move(skiaApi)));

  _jsRuntime->global().setProperty(*_jsRuntime, "SkiaViewApi",
                                   makeJsiObject(*_jsRuntime, _viewApi));

  // The WebGPU JS API (RNWebGPU, navigator.gpu, constants, createImageBitmap)
  // is no longer installed here: react-native-webgpu is the single WebGPU API
  // surface for React Native. Graphite keeps Dawn as an internal
  // implementation detail only.
}

// The definitions below need the complete recorder types. Parsing the
// recorder headers costs about 1.5 GB of compiler memory, so they live in this
// translation unit, which parses them already. A separate translation unit
// would compile in parallel and add to the peak memory of the build.

void RNSkPictureRenderer::setRecorder(std::shared_ptr<Recorder> recorder) {
  sk_sp<SkPicture> picture;
  if (recorder != nullptr && recorder->variables.empty()) {
    picture = recorder->makePicture();
    recorder = nullptr;
  }
  std::shared_ptr<Recorder> retired;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retired = std::move(_recorder);
    _recorder = std::move(recorder);
    _picture = std::move(picture);
  }
  retired = nullptr;
  _requestRedraw();
}

bool RNSkPictureRenderer::applyUpdatesTo(
    const std::shared_ptr<Recorder> &recorder, jsi::Runtime &runtime,
    double recorderId, const jsi::Array &values) {
  if (recorder == nullptr || recorder->id != recorderId) {
    return false;
  }
  recorder->applyUpdates(runtime, values);
  return true;
}

bool RNSkPictureRenderer::applyUpdates(jsi::Runtime &runtime, double recorderId,
                                       const jsi::Array &values) {
  std::shared_ptr<Recorder> recorder;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    recorder = _recorder;
  }
  // Outside the renderer lock: a commit replacing the recorder must not wait
  // for the update. Should it land while this runs, the update goes into the
  // retired recorder and the redraw that follows draws the new one.
  return applyUpdatesTo(recorder, runtime, recorderId, values);
}

void RNSkPictureRenderer::replay(SkCanvas *canvas, Recorder *recorder) {
  DrawingCtx ctx(canvas);
  recorder->play(&ctx);
}

} // namespace RNSkia

namespace RNJsi {

ViewProperty::ViewProperty(jsi::Runtime &runtime, const jsi::Value &value) {
  if (auto picture =
          RNSkia::tryGetJsiObject<RNSkia::JsiSkPicture>(runtime, value)) {
    _value = picture->getObject();
  } else if (auto recorder =
                 RNSkia::tryGetJsiObject<RNSkia::JsiRecorder>(runtime, value)) {
    _value = recorder->getObject();
  }
}

} // namespace RNJsi
