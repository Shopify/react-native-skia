#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"

#include "RNSkLog.h"
#include "RNRecorder.h"

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiRecorder : public JsiSkWrappingSharedPtrHostObject<Recorder> {
public:
  JsiRecorder(std::shared_ptr<RNSkPlatformContext> context, const Recorder &recorder)
      : JsiSkWrappingSharedPtrHostObject(std::move(context),
                                         std::make_shared<Recorder>(recorder)) {}


  JSI_HOST_FUNCTION(savePaint) {
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restorePaint) {
    return jsi::Value::undefined();
  }

  EXPORT_JSI_API_TYPENAME(JsiRecorder, Recorder)

  JSI_EXPORT_FUNCTIONS(
    JSI_EXPORT_FUNC(JsiRecorder, savePaint),
    JSI_EXPORT_FUNC(JsiRecorder, restorePaint)
  )

  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
        // Return the newly constructed object
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiRecorder>(std::move(context), Recorder()));
    };
  }
};

} // namespace RNSkia