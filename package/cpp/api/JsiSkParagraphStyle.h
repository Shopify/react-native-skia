#pragma once

#include <codecvt>
#include <locale>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include <JsiSkHostObjects.h>
#include <JsiSkTextStyle.h>

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
 Implementation of the ParagraphStyle object in JSI
 */
class JsiSkParagraphStyle
    : public JsiSkWrappingSharedPtrHostObject<ParagraphStyle> {
public:
  JSI_HOST_FUNCTION(setTextStyle) {
    auto textStyle =
        getArgumentAsHostObject<JsiSkTextStyle>(runtime, arguments, count, 0);
    getObject()->setTextStyle(*textStyle->getObject().get());
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setTextDirection) {
    auto value = static_cast<TextDirection>(
        getArgumentAsNumber(runtime, arguments, count, 0));
    getObject()->setTextDirection(value);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setTextAlign) {
    auto value = static_cast<TextAlign>(
        getArgumentAsNumber(runtime, arguments, count, 0));
    getObject()->setTextAlign(value);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setEllipsis) {
    auto value =
        getArgumentAsString(runtime, arguments, count, 0).utf8(runtime);
    std::u16string uStr;
    fromUTF8(value, uStr);
    getObject()->setEllipsis(uStr);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setMaxLines) {
    auto value = getArgumentAsNumber(runtime, arguments, count, 0);
    getObject()->setMaxLines(value);
    return thisValue.asObject(runtime);
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphStyle, setTextStyle),
                       JSI_EXPORT_FUNC(JsiSkParagraphStyle, setTextDirection),
                       JSI_EXPORT_FUNC(JsiSkParagraphStyle, setTextAlign),
                       JSI_EXPORT_FUNC(JsiSkParagraphStyle, setEllipsis),
                       JSI_EXPORT_FUNC(JsiSkParagraphStyle, setMaxLines))

  explicit JsiSkParagraphStyle(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkWrappingSharedPtrHostObject(std::move(context),
                                         std::make_shared<ParagraphStyle>()) {}

private:
  template <typename T>
  void fromUTF8(
      const std::string &source,
      std::basic_string<T, std::char_traits<T>, std::allocator<T>> &result) {
    std::wstring_convert<std::codecvt_utf8_utf16<T>, T> convertor;
    result = convertor.from_bytes(source);
  }
};

/**
 Implementation of the ParagraphStyleFactory for making ParagraphStyle JSI
 objects
 */
class JsiSkParagraphStyleFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkParagraphStyle>(getContext()));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphStyleFactory, Make))

  explicit JsiSkParagraphStyleFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
