#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "JsiSkRuntimeEffect.h"
#include <SkRuntimeEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

    using namespace facebook;

    class JsiSkRuntimeShaderBuilder : public JsiSkWrappingSharedPtrHostObject<SkRuntimeShaderBuilder> {
    public:
       
        /**
         Constructor
         */
        JsiSkRuntimeShaderBuilder(std::shared_ptr<RNSkPlatformContext> context, const SkRuntimeShaderBuilder &rt)
                : JsiSkWrappingSharedPtrHostObject<SkRuntimeShaderBuilder>(
                std::move(context), std::make_shared<SkRuntimeShaderBuilder>(rt)){}

        /**
          Returns the underlying object from a host object of this type
         */
        static std::shared_ptr<SkRuntimeShaderBuilder> fromValue(jsi::Runtime &runtime,
                                                 const jsi::Value &obj) {
            const auto& object = obj.asObject(runtime);
            return object.asHostObject<JsiSkRuntimeShaderBuilder>(runtime)->getObject();
           
        }

        /**
          Returns the jsi object from a host object of this type
         */
        static jsi::Value toValue(jsi::Runtime &runtime,
                                  std::shared_ptr<RNSkPlatformContext> context,
                                  const SkRuntimeShaderBuilder &rt) {
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkRuntimeShaderBuilder>(std::move(context), rt));
        }

        /**
         * Creates the function for construction a new instance of the SkRect
         * wrapper
         * @param context platform context
         * @return A function for creating a new host object wrapper for the SkRect
         * class
         */
        static const jsi::HostFunctionType
        createCtor(std::shared_ptr<RNSkPlatformContext> context) {
            return JSI_HOST_FUNCTION_LAMBDA {
                auto rt = JsiSkRuntimeEffect::fromValue(runtime, arguments[0]);
                auto rtb = SkRuntimeShaderBuilder(rt);
                // Return the newly constructed object
                return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkRuntimeShaderBuilder>(std::move(context), std::move(rtb)));
            };
        }
    };
} // namespace RNSkia
