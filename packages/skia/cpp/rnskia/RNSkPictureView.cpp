// The recorder headers depend on the include order established by
// JsiSkApi.h, so everything that needs a complete Recorder lives here rather
// than in RNSkPictureView.h (which platform views include on its own).
#include "api/JsiSkApi.h"

#include "RNSkPictureView.h"

#include "api/recorder/DrawingCtx.h"
#include "api/recorder/JsiRecorder.h"
#include "api/recorder/RNRecorder.h"

namespace RNSkia {

bool RNSkPictureRenderer::applyUpdates(jsi::Runtime &runtime,
                                       const jsi::Array &values) {
  std::lock_guard<std::mutex> lock(_mutex);
  if (_recorder == nullptr) {
    return false;
  }
  _recorder->applyUpdates(runtime, values);
  return true;
}

std::shared_ptr<Recorder>
RNSkPictureRenderer::recorderFromValue(jsi::Runtime &runtime,
                                       const jsi::Value &value) {
  auto jsiRecorder = tryGetJsiObject<JsiRecorder>(runtime, value);
  if (jsiRecorder == nullptr) {
    return nullptr;
  }
  return jsiRecorder->getObject();
}

void RNSkPictureRenderer::replay(SkCanvas *canvas, Recorder *recorder) {
  DrawingCtx ctx(canvas);
  recorder->play(&ctx);
}

} // namespace RNSkia
