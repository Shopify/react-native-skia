#pragma once

#include <memory>
#include <utility>
#include <string>

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

  JSI_HOST_FUNCTION(TokenizeText) {
    if (!getContext()->requiresClientICU()) {
      return jsi::Value::null();
    }
    const std::string inputText = arguments[0].asString(runtime).utf8(runtime);
    auto result = getContext()->tokenizeText(inputText);
    // Extract individual vectors from the tuple
    auto &wordsUtf16 = std::get<0>(result);
    auto &graphemesUtf16 = std::get<1>(result);
    auto &lineBreaksUtf16 = std::get<2>(result);

    // Create JS arrays from the C++ vectors
    jsi::Array wordsArray(runtime, wordsUtf16.size());
    for (size_t i = 0; i < wordsUtf16.size(); i++) {
      wordsArray.setValueAtIndex(runtime, i,
                                 jsi::Value(static_cast<int>(wordsUtf16[i])));
    }

    jsi::Array graphemesArray(runtime, graphemesUtf16.size());
    for (size_t i = 0; i < graphemesUtf16.size(); i++) {
      graphemesArray.setValueAtIndex(
          runtime, i, jsi::Value(static_cast<int>(graphemesUtf16[i])));
    }

    // For lineBreaksUtf16, you need to create an array of arrays
    jsi::Array breaksArray(runtime, lineBreaksUtf16.size());
    for (size_t i = 0; i < lineBreaksUtf16.size(); i++) {
      jsi::Array breakArray(runtime, 2);
      breakArray.setValueAtIndex(
          runtime, 0, jsi::Value(static_cast<int>(lineBreaksUtf16[i].pos)));
      breakArray.setValueAtIndex(
          runtime, 1,
          jsi::Value(static_cast<int>(lineBreaksUtf16[i].breakType)));
      breaksArray.setValueAtIndex(runtime, i, breakArray);
    }

    // Create the result JS object
    jsi::Object resultObj(runtime);
    resultObj.setProperty(runtime, "words", wordsArray);
    resultObj.setProperty(runtime, "graphemes", graphemesArray);
    resultObj.setProperty(runtime, "breaks", breaksArray);

    return resultObj;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphFactory,
                                       RequiresClientICU),
                       JSI_EXPORT_FUNC(JsiSkParagraphFactory, TokenizeText))

  explicit JsiSkParagraphFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
