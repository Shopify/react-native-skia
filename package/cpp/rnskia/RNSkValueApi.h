
#pragma once

#include <JsiHostObject.h>
#include <RNSkPlatformContext.h>
#include <RNSkValue.h>
#include <RNSkDerivedValue.h>
#include <RNSkAnimation.h>
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
  
  JSI_HOST_FUNCTION(createAnimation) {
    return jsi::Object::createFromHostObject(runtime,
      std::make_shared<RNSkAnimation>(_platformContext,
                                      ++_valueIdentifier,
                                      runtime,
                                      arguments,
                                      count));
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkValueApi, createValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createDerivedValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createAnimation))

private:
  // Platform context
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::atomic<long> _valueIdentifier;  
};
} // namespace RNSkia
