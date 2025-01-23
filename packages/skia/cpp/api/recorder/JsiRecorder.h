#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"

#include "RNRecorder.h"
#include "DrawingCtx.h"
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
    PaintCmdProps props;
    getObject()->savePaint(props);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(materializePaint){
    getObject()->materializePaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawCircle) {
    CircleCmdProps props;
    convert(runtime, arguments[0].asObject(runtime), props, getObject()->variables);
    getObject()->drawCircle(props);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restorePaint) {
    getObject()->restorePaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(play) {
    auto jsiCanvas = arguments[0].asObject(runtime).asHostObject<JsiSkCanvas>(runtime);
    DrawingCtx ctx(jsiCanvas->getCanvas());
    getObject()->play(ctx);
    return jsi::Value::undefined();
  }

  EXPORT_JSI_API_TYPENAME(JsiRecorder, Recorder)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiRecorder, savePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, restorePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, drawCircle),
                       JSI_EXPORT_FUNC(JsiRecorder, materializePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, play))

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
