#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkHostObjects.h"
#include "JsiSkCanvas.h"

#include "RNSkLog.h"
#include "Recorder/DrawingCtx.h"
#include "Recorder/Player.h"

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
      auto commands = arguments[1].asObject(runtime).asArray(runtime);
      auto size = commands.size(runtime);
      DrawingCtx ctx(canvas);
      for (int i; i<=size; i++) {
        auto command = commands.getValueAtIndex(runtime, i).asObject(runtime);
        play(&ctx, command);
      }
      return jsi::Value::undefined();
    };
  }
};

} // namespace RNSkia
