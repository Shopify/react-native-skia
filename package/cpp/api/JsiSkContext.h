#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "RNSkContext.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkPlatformContext;

class JsiSkContext : public JsiSkWrappingSharedPtrHostObject<RNSkContext> {
public:
  JsiSkContext(std::shared_ptr<RNSkPlatformContext> platformContext, std::shared_ptr<RNSkContext> skiaContext)
      : JsiSkWrappingSharedPtrHostObject(std::move(platformContext), std::move(skiaContext)) {}
  
  std::shared_ptr<RNSkContext> getSkiaContext() { return getObject(); }

  EXPORT_JSI_API_TYPENAME(JsiSkContext, Context)

  JSI_HOST_FUNCTION(isValid) { return getObject()->isValid(); }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkContext, isValid))
};

} // namespace RNSkia
