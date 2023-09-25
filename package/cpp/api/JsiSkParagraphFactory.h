#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "skparagraph/src/ParagraphBuilderImpl.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace para = skia::textlayout;

class JsiSkParagraphFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(RequiresClientICU) {
	return jsi::Value(para::ParagraphBuilderImpl::RequiresClientICU());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphFactory,
                                       RequiresClientICU))

  explicit JsiSkParagraphFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
