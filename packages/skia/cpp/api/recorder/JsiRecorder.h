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
    PaintCmdProps props;
    getObject()->savePaint(props);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(materializePaint) {
    getObject()->materializePaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawCircle) {
    getObject()->drawCircle(runtime, arguments[0].asObject(runtime), getObject()->variables);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restorePaint) {
    getObject()->restorePaint();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(play) {
    auto jsiCanvas =
        arguments[0].asObject(runtime).asHostObject<JsiSkCanvas>(runtime);
    DrawingCtx ctx(jsiCanvas->getCanvas());
    getObject()->play(&ctx);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(applyUpdates) {
    auto values = arguments[0].asObject(runtime).asArray(runtime);
    auto size = values.size(runtime);
    auto recorder = getObject();
    for (int i = 0; i < size; i++) {
      auto sharedValue = values.getValueAtIndex(runtime, i).asObject(runtime);
      auto name = sharedValue.getProperty(runtime, "name")
                      .asString(runtime)
                      .utf8(runtime);
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

  EXPORT_JSI_API_TYPENAME(JsiRecorder, Recorder)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiRecorder, savePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, restorePaint),
                       JSI_EXPORT_FUNC(JsiRecorder, drawCircle),
                       JSI_EXPORT_FUNC(JsiRecorder, materializePaint),
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
