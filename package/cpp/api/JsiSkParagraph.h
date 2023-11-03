#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include <JsiSkFont.h>
#include <JsiSkFontMgr.h>
#include <JsiSkHostObjects.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "Paragraph.h"
#include "ParagraphBuilder.h"
#include "ParagraphStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

using namespace skia::textlayout; // NOLINT

/**
 Implementation of the Paragraph object in JSI
 */
class JsiSkParagraph : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(layout) {
    auto width = getArgumentAsNumber(runtime, arguments, count, 0);
    _paragraph->layout(width);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraph, layout))

  explicit JsiSkParagraph(std::shared_ptr<RNSkPlatformContext> context,
                          ParagraphBuilder *paragraphBuilder)
      : JsiSkHostObject(std::move(context)) {
    _paragraph = paragraphBuilder->Build();
  }

  Paragraph *getParagraph() { return _paragraph.get(); }

private:
  std::unique_ptr<Paragraph> _paragraph;
};

} // namespace RNSkia
