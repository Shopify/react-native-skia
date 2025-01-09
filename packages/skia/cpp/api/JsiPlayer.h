#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkHostObjects.h"
#include "JsiSkCanvas.h"

#include "RNSkLog.h"

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class Player {};

class JsiPlayer : public JsiSkWrappingSharedPtrHostObject<Player> {
public:
 

  /**
   * Creates the function for construction a new instance of the SkFont
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the SkFont
   * class
   */
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto canvas = arguments[0].asObject(runtime).asHostObject<JsiSkCanvas>(runtime)->getCanvas();
      auto recording = arguments[1].asObject(runtime).asArray(runtime);
      auto commands = recording.size(runtime);
      
      return jsi::Value::undefined();
    };
  }
};

} // namespace RNSkia
