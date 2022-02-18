#pragma once

#include <JsiHostObject.h>
#include <RNSkPlatformContext.h>
#include <RNSkMeasureTime.h>
#include <RNSkReadonlyValue.h>
#include <RNSkClockValue.h>
#include <jsi/jsi.h>

namespace RNSkia
{
using namespace facebook;
/**
 Implements a Value that can be both read and written to. It inherits from the ReadonlyValue with
 functionailty for subscribing to changes.
 */
class RNSkValue : public RNSkReadonlyValue
{
public:
  RNSkValue(std::shared_ptr<RNSkPlatformContext> platformContext,
            jsi::Runtime& runtime, const jsi::Value *arguments, size_t count)
      : RNSkReadonlyValue(platformContext) {
        if(count == 1) {
          update(runtime, arguments[0]);
        }
      }
  
  JSI_PROPERTY_SET(value) {
    update(runtime, value);
  }
  
  JSI_EXPORT_PROPERTY_SETTERS(JSI_EXPORT_PROP_SET(RNSkValue, value))
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkReadonlyValue, __typename__),
                              JSI_EXPORT_PROP_GET(RNSkReadonlyValue, value))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkValue, addListener))

};

}
