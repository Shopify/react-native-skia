#pragma once 

#include <jsi/jsi.h>

#include "include/core/SkPath.h"

#include "JsiSkPath.h"

namespace RNSkia {

static std::shared_ptr<SkPath> processPath(jsi::Runtime& runtime, const jsi::Value &value) {
    if (value.isString()) {
        auto pathString = value.getString(runtime).utf8(runtime);
        SkPath result;

        if (SkParsePath::FromSVGString(pathString.c_str(), &result)) {
            return std::make_shared<SkPath>(result);
        } else {
            throw std::runtime_error("Could not parse path from string.");
        }
    } else if (value.isObject()) {
      auto ptr = std::dynamic_pointer_cast<JsiSkPath>(value.asObject(runtime).asHostObject(runtime));
      if (ptr != nullptr) {
        return ptr->getObject();
      }
    }
    return nullptr;
}

} // namespace RNSkia
