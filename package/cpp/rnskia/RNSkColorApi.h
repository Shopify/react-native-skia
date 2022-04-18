#pragma once

#include <JsiHostObject.h>
#include <jsi/jsi.h>

#include "colors/CSSColorParser.h"

namespace RNSkia {
    using namespace facebook;

    class RNSkColorApi : public JsiHostObject {
    public:
        /**
         * Constructor
         * @param platformContext Platform context
         */
        RNSkColorApi()
                : JsiHostObject() {
        }

        /**
         * Destructor
         */
        ~RNSkColorApi() {
        }

        JSI_HOST_FUNCTION(parse) {
          auto text = arguments[0].asString(runtime).utf8(runtime);
          auto color = CSSColorParser::parse(text);
          auto jsiColor = jsi::Array(runtime, 4);
          jsiColor.setValueAtIndex(runtime, 0, jsi::Value(static_cast<double>(color.r)));
          jsiColor.setValueAtIndex(runtime, 1, jsi::Value(static_cast<double>(color.g)));
          jsiColor.setValueAtIndex(runtime, 2, jsi::Value(static_cast<double>(color.b)));
          jsiColor.setValueAtIndex(runtime, 3, jsi::Value(static_cast<double>(color.a)));
          return jsiColor;
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkColorApi, parse))
    };
} // namespace RNSkia
