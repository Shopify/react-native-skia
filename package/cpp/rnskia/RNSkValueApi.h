
#pragma once

#include <JsiHostObject.h>
#include <RNSkPlatformContext.h>
#include <RNSkValue.h>
#include <RNSkClockValue.h>
#include <RNSkDerivedValue.h>
#include <RNSkAnimationValue.h>
#include <jsi/jsi.h>

namespace RNSkia {
using namespace facebook;

class RNSkValueApi : public JsiHostObject {
public:
  /**
   * Constructor
   * @param platformContext Platform context
   */
  RNSkValueApi(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiHostObject(), _platformContext(platformContext) {
        _valueIdentifier = 50000;
      }

  /**
   * Destructor
   */
  ~RNSkValueApi() {    
  }
  
  JSI_HOST_FUNCTION(createValue) {
    return jsi::Object::createFromHostObject(runtime,
      std::make_shared<RNSkValue>(_platformContext, runtime, arguments, count));
  }
  
  JSI_HOST_FUNCTION(createDerivedValue) {
    return jsi::Object::createFromHostObject(runtime,
      std::make_shared<RNSkDerivedValue>(_platformContext, runtime, arguments, count));
  }
  
  JSI_HOST_FUNCTION(createClockValue) {
    return jsi::Object::createFromHostObject(runtime,
      std::make_shared<RNSkClockValue>(_platformContext,
                                       ++_valueIdentifier,
                                       runtime,
                                       arguments,
                                       count));
  }
  
  JSI_HOST_FUNCTION(createAnimationValue) {
    return jsi::Object::createFromHostObject(runtime,
      std::make_shared<RNSkAnimationValue>(_platformContext,
                                           ++_valueIdentifier,
                                           runtime,
                                           arguments,
                                           count));
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkValueApi, createValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createDerivedValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createClockValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createAnimationValue))

private:
  // Platform context
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::atomic<long> _valueIdentifier;  
};
} // namespace RNSkia
