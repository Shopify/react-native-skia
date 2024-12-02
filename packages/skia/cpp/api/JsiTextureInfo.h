#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "RNSkPlatformContext.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiTextureInfo : public JsiSkWrappingSharedPtrHostObject<TextureInfo> {
public:
  JsiTextureInfo(std::shared_ptr<RNSkPlatformContext> context,
                 std::shared_ptr<TextureInfo> info)
      : JsiSkWrappingSharedPtrHostObject<TextureInfo>(context,
                                                      std::move(info)) {}

  EXPORT_JSI_API_TYPENAME(JsiTextureInfo, TextureInfo)

  JSI_HOST_FUNCTION(isMetalTexture) {
    return jsi::Value(!!getObject()->mtlTexture);
  }

  // TODO: we can had other setters/getters here

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiTextureInfo, isMetalTexture))

  /**
   * Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<TextureInfo> fromValue(jsi::Runtime &runtime,
                                                const jsi::Value &obj) {
    const auto &object = obj.asObject(runtime);
    if (object.isHostObject(runtime)) {
      return object.asHostObject<JsiTextureInfo>(runtime)->getObject();
    } else {
      TextureInfo texInfo;
      if (object.hasProperty(runtime, "mtlTexture")) {
        texInfo.mtlTexture = reinterpret_cast<const void *>(
            object.getProperty(runtime, "mtlTexture")
                .asBigInt(runtime)
                .asUint64(runtime));
      }
      if (object.hasProperty(runtime, "glTarget")) {
        texInfo.glTarget = object.getProperty(runtime, "glTarget").asNumber();
        texInfo.glID = object.getProperty(runtime, "glID").asNumber();
        texInfo.glFormat = object.getProperty(runtime, "glFormat").asNumber();
        texInfo.glProtected =
            object.getProperty(runtime, "glProtected").asBool();
      }
      return std::make_shared<TextureInfo>(texInfo);
    }
  }
};

} // namespace RNSkia
