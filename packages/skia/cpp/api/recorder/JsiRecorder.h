#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"

#include "DrawingCtx.h"
#include "RNRecorder.h"
#include "RNSkLog.h"

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiRecorder : public JsiSkWrappingSharedPtrHostObject<Recorder> {
public:
  JsiRecorder(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkWrappingSharedPtrHostObject(std::move(context),
                                         std::make_shared<Recorder>()) {}

  JSI_HOST_FUNCTION(savePaint) {
    getObject()->savePaint(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(materializePaint) {
    getObject()->materializePaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawCircle) {
    getObject()->drawCircle(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restorePaint) {
    getObject()->restorePaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPaint) {
    getObject()->drawPaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(play) {
    SkPictureRecorder pictureRecorder;
    SkISize size = SkISize::Make(2'000'000, 2'000'000);
    SkRect rect = SkRect::Make(size);
    auto canvas = pictureRecorder.beginRecording(rect, nullptr);
    DrawingCtx ctx(canvas);
    getObject()->play(&ctx);
    auto picture = pictureRecorder.finishRecordingAsPicture();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPicture>(getContext(), picture));
  }

  JSI_HOST_FUNCTION(applyUpdates) {
    auto values = arguments[0].asObject(runtime).asArray(runtime);
    auto size = values.size(runtime);
    auto recorder = getObject();
    for (int i = 0; i < size; i++) {
      auto sharedValue = values.getValueAtIndex(runtime, i).asObject(runtime);
      auto name = "variable" + std::to_string(i);
      // Look up the conversion functions for this name
      auto it = recorder->variables.find(name);
      if (it != recorder->variables.end()) {
        // Execute each conversion function in the vector
        const auto &conversionFunctions = it->second;
        for (const auto &conversionFunc : conversionFunctions) {
          conversionFunc(runtime, sharedValue);
        }
      }
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(saveGroup) {
    getObject()->saveGroup();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restoreGroup) {
    getObject()->restoreGroup();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restorePaintDeclaration) {
    getObject()->restorePaintDeclaration();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pushPathEffect) {
    getObject()->pushPathEffect(runtime,
                                arguments[0].asString(runtime).utf8(runtime),
                                arguments[1].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pushImageFilter) {
    getObject()->pushImageFilter(runtime,
                                 arguments[0].asString(runtime).utf8(runtime),
                                 arguments[1].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pushColorFilter) {
    getObject()->pushColorFilter(runtime,
                                 arguments[0].asString(runtime).utf8(runtime),
                                 arguments[1].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pushShader) {
    getObject()->pushShader(runtime,
                            arguments[0].asString(runtime).utf8(runtime),
                            arguments[1].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pushBlurMaskFilter) {
    getObject()->pushBlurMaskFilter(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(composePathEffect) {
    getObject()->composePathEffect();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(composeColorFilter) {
    getObject()->composeColorFilter();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(composeImageFilter) {
    getObject()->composeImageFilter();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(saveCTM) {
    getObject()->saveCTM(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restoreCTM) {
    getObject()->restoreCTM();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(saveLayer) {
    getObject()->saveLayer();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(saveBackdropFilter) {
    getObject()->saveBackdropFilter();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawBox) {
    auto boxProps = arguments[0].asObject(runtime);
    auto shadowsArray = arguments[1].asObject(runtime).asArray(runtime);
    getObject()->drawBox(runtime, boxProps, shadowsArray);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImage) {
    getObject()->drawImage(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPoints) {
    getObject()->drawPoints(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPath) {
    getObject()->drawPath(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawRect) {
    getObject()->drawRect(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawRRect) {
    getObject()->drawRRect(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawOval) {
    getObject()->drawOval(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawLine) {
    getObject()->drawLine(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPatch) {
    getObject()->drawPatch(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawVertices) {
    getObject()->drawVertices(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawDiffRect) {
    getObject()->drawDiffRect(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawText) {
    getObject()->drawText(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawTextPath) {
    getObject()->drawTextPath(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawTextBlob) {
    getObject()->drawTextBlob(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawGlyphs) {
    getObject()->drawGlyphs(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPicture) {
    getObject()->drawPicture(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageSVG) {
    getObject()->drawImageSVG(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawParagraph) {
    getObject()->drawParagraph(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawAtlas) {
    getObject()->drawAtlas(runtime, arguments[0].asObject(runtime));
    return jsi::Value::undefined();
  }

  EXPORT_JSI_API_TYPENAME(JsiRecorder, Recorder)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiRecorder, saveGroup),
                       JSI_EXPORT_FUNC(JsiRecorder, restoreGroup),
                       JSI_EXPORT_FUNC(JsiRecorder, savePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, restorePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, restorePaintDeclaration),
                       JSI_EXPORT_FUNC(JsiRecorder, materializePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, pushPathEffect),
                       JSI_EXPORT_FUNC(JsiRecorder, pushImageFilter),
                       JSI_EXPORT_FUNC(JsiRecorder, pushColorFilter),
                       JSI_EXPORT_FUNC(JsiRecorder, pushShader),
                       JSI_EXPORT_FUNC(JsiRecorder, pushBlurMaskFilter),
                       JSI_EXPORT_FUNC(JsiRecorder, composePathEffect),
                       JSI_EXPORT_FUNC(JsiRecorder, composeColorFilter),
                       JSI_EXPORT_FUNC(JsiRecorder, composeImageFilter),
                       JSI_EXPORT_FUNC(JsiRecorder, saveCTM),
                       JSI_EXPORT_FUNC(JsiRecorder, restoreCTM),
                       JSI_EXPORT_FUNC(JsiRecorder, drawPaint),
                       JSI_EXPORT_FUNC(JsiRecorder, saveLayer),
                       JSI_EXPORT_FUNC(JsiRecorder, saveBackdropFilter),
                       JSI_EXPORT_FUNC(JsiRecorder, drawBox),
                       JSI_EXPORT_FUNC(JsiRecorder, drawImage),
                       JSI_EXPORT_FUNC(JsiRecorder, drawCircle),
                       JSI_EXPORT_FUNC(JsiRecorder, drawPoints),
                       JSI_EXPORT_FUNC(JsiRecorder, drawPath),
                       JSI_EXPORT_FUNC(JsiRecorder, drawRect),
                       JSI_EXPORT_FUNC(JsiRecorder, drawRRect),
                       JSI_EXPORT_FUNC(JsiRecorder, drawOval),
                       JSI_EXPORT_FUNC(JsiRecorder, drawLine),
                       JSI_EXPORT_FUNC(JsiRecorder, drawPatch),
                       JSI_EXPORT_FUNC(JsiRecorder, drawVertices),
                       JSI_EXPORT_FUNC(JsiRecorder, drawDiffRect),
                       JSI_EXPORT_FUNC(JsiRecorder, drawText),
                       JSI_EXPORT_FUNC(JsiRecorder, drawTextPath),
                       JSI_EXPORT_FUNC(JsiRecorder, drawTextBlob),
                       JSI_EXPORT_FUNC(JsiRecorder, drawGlyphs),
                       JSI_EXPORT_FUNC(JsiRecorder, drawPicture),
                       JSI_EXPORT_FUNC(JsiRecorder, drawImageSVG),
                       JSI_EXPORT_FUNC(JsiRecorder, drawParagraph),
                       JSI_EXPORT_FUNC(JsiRecorder, drawAtlas),
                       JSI_EXPORT_FUNC(JsiRecorder, play),
                       JSI_EXPORT_FUNC(JsiRecorder, applyUpdates))

  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiRecorder>(std::move(context)));
    };
  }
};

} // namespace RNSkia
