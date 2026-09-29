#pragma once

#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <utility>
#include <variant>

#include "api/JsiSkPicture.h"

namespace RNSkia {
class Recorder;
}

namespace RNJsi {
namespace jsi = facebook::jsi;

class ViewProperty {
public:
  ViewProperty(jsi::Runtime &runtime, const jsi::Value &value) {
    auto jsiPicture =
        RNSkia::tryGetJsiObject<RNSkia::JsiSkPicture>(runtime, value);
    if (jsiPicture) {
      _value = jsiPicture->getObject();
    }
  }

  explicit ViewProperty(std::shared_ptr<RNSkia::Recorder> recorder) {
    if (recorder) {
      _value = std::move(recorder);
    }
  }

  bool isNull() { return std::holds_alternative<std::nullptr_t>(_value); }

  bool isPicture() { return std::holds_alternative<sk_sp<SkPicture>>(_value); }

  bool isRecorder() {
    return std::holds_alternative<std::shared_ptr<RNSkia::Recorder>>(_value);
  }

  sk_sp<SkPicture> getPicture() { return std::get<sk_sp<SkPicture>>(_value); }

  std::shared_ptr<RNSkia::Recorder> getRecorder() {
    return std::get<std::shared_ptr<RNSkia::Recorder>>(_value);
  }

private:
  std::variant<std::nullptr_t, sk_sp<SkPicture>,
               std::shared_ptr<RNSkia::Recorder>>
      _value = nullptr;
};
} // namespace RNJsi
