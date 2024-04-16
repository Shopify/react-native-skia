#pragma once

#include <functional>
#include <memory>
#include <string>

#include "RNSkContext.h"

#include <jsi/jsi.h>
#import <Metal/Metal.h>

namespace facebook {
namespace react {
class CallInvoker;
}
} // namespace facebook

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkiOSContext: public RNSkContext {
public:
  RNSkiOSContext() {
    device = MTLCreateSystemDefaultDevice();
    commandQueue = [device newCommandQueue];
    skContext = GrDirectContext::MakeMetal((__bridge void *)device,
                                           (__bridge void *)commandQueue);
    if (skContext == nullptr) {
      throw std::runtime_error("Failed to create Metal Skia Context!");
    }
  }
  
  bool isValid() override {
    return skContext != nullptr;
  }
  
  sk_sp<GrDirectContext> getDirectContext() override {
    return skContext;
  }
  
  id<MTLDevice> getDevice() {
    return device;
  }
  
  id<MTLCommandQueue> getCommandQueue() {
    return commandQueue;
  }
  
private:
  id<MTLDevice> device = nil;
  id<MTLCommandQueue> commandQueue = nil;
  sk_sp<GrDirectContext> skContext = nullptr;
};

} // namespace RNSkia
