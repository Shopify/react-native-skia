#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"


namespace RNSkia {

namespace jsi = facebook::jsi;
namespace para = skia::textlayout;

class JsiSkParagraphFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(RequiresClientICU) {
    return jsi::Value(getContext()->requiresClientICU());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphFactory,
                                       RequiresClientICU))

  explicit JsiSkParagraphFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia