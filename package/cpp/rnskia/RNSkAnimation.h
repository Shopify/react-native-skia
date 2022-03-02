
#pragma once

#include <JsiHostObject.h>
#include <RNSkPlatformContext.h>
#include <RNSkMeasureTime.h>
#include <RNSkClockValue.h>
#include <RNSkReadonlyValue.h>
#include <jsi/jsi.h>

namespace RNSkia
{
using namespace facebook;

/**
 Implements a readonly Value that is updated every time the screen is redrawn. Its value will be the
 number of milliseconds since the animation value was started.
 */
class RNSkAnimation : public RNSkClockValue, public std::enable_shared_from_this<RNSkAnimation>
{
  
public:
  RNSkAnimation(std::shared_ptr<RNSkPlatformContext> platformContext,
                     size_t identifier,
                     jsi::Runtime& runtime,
                     const jsi::Value *arguments,
                     size_t count)
      : RNSkClockValue(platformContext, identifier, runtime, arguments, count) {
    // Save the update function
    _updateFunction = std::make_shared<jsi::Function>(arguments[0].asObject(runtime).asFunction(runtime));
    
    // Set up args for faster calling
    _args.resize(2);
    _args[1] = jsi::Function::createFromHostFunction(runtime,
                                                     jsi::PropNameID::forUtf8(runtime, "stop"),
                                                     0,
                                                     JSI_HOST_FUNCTION_LAMBDA {
      stopAnimation();
      return jsi::Value::undefined();
    });
        
    // Is there a value in the args containing a value that this animation should control?
    if(count > 1 && arguments[1].isObject()) {
      _controlledValue = arguments[1].asObject(runtime).asHostObject<RNSkReadonlyValue>(runtime);
    }
        
    // First update
    tick(runtime, get_value(runtime));
  }
  
  ~RNSkAnimation() {
    // We need to stop/unsubscribe
    stopAnimation();
    _controlledValue = nullptr;
    _isValid = false;
  }
  
  void startAnimation() override {
    RNSkClockValue::startAnimation();
    subscribe();
  }
  
  void stopAnimation() override {
    unsubscribe();
    RNSkClockValue::stopAnimation();
  }
    
protected:
   
  void tick(jsi::Runtime &runtime, const jsi::Value &value) override {
    // Get the next value
    _args[0] = value.asNumber();
    auto nextValue = _updateFunction->call(runtime, static_cast<const jsi::Value*>(_args.data()), _args.size());
    
    // Update controlled value if it exists
    if(_controlledValue != nullptr) {
      _inControlledValueUpdate = true;
      _controlledValue->update(runtime, nextValue);
      _inControlledValueUpdate = false;
    }
    if(_isValid) {
    
    // Update self
    update(runtime, nextValue);
    }
  }
  
private:
  
  void subscribe() {
    // Remove existing subscription
    unsubscribe();
    
    if(_controlledValue != nullptr) {
      // Store reference to self in controlled value, so that the controlled value
      // can be used to hold a reference to this object alive
      _driverId = _controlledValue->addDriver(shared_from_this());
      
      // Subscribe to changes in controlled value
      auto dispatch = std::bind(&RNSkAnimation::controlledValueDidUpdate, this, std::placeholders::_1);
      _unsubscribe = std::make_shared<std::function<void()>>(
        _controlledValue->addListener(dispatch));
    }
  }
  
  void unsubscribe() {
    if(_driverId > 0) {
      // remove ourselves as the driver for the controlled value. This
      // also means the the controlled value no longer holds a reference to
      // this object.
      _controlledValue->removeDriver(_driverId);
      _driverId = 0;
    }
    
    if(_unsubscribe != nullptr) {
      (*_unsubscribe)();
      _unsubscribe = nullptr;
    }
  }
  
  void controlledValueDidUpdate(jsi::Runtime&) {
    if(_inControlledValueUpdate) {
      return;
    }
    // If we get here we know that our controlled value
    // was updated from somewhere else - and we should
    // end our animation.
    stopAnimation();
  }
  
  std::atomic<bool> _inControlledValueUpdate = { false };
  std::shared_ptr<jsi::Function> _updateFunction;
  std::shared_ptr<RNSkReadonlyValue> _controlledValue;
  std::vector<jsi::Value> _args;
  std::shared_ptr<std::function<void()>> _unsubscribe;
  std::atomic<long> _driverId = { 0 };
  std::atomic<bool> _isValid = { true };
};
}
