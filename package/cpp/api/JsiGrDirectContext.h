#pragma once


#include "JsiSkHostObjects.h"
#include "RNSkLog.h"
#include <jsi/jsi.h>


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/GrDirectContext.h"

#pragma clang diagnostic pop

namespace RNSkia {

    namespace jsi = facebook::jsi;

    class JsiGrDirectContext : public JsiSkWrappingSkPtrHostObject<GrDirectContext> {
    public:
        EXPORT_JSI_API_TYPENAME(JsiGrDirectContext, "GrDirectContext")

        JsiGrDirectContext(std::shared_ptr<RNSkPlatformContext> context, sk_sp<GrDirectContext> grDirectContext)
                : JsiSkWrappingSkPtrHostObject(std::move(context),
                                                   grDirectContext) {}

        /**
         * Creates the function for construction a new instance of the SkFont
         * wrapper
         * @param context Platform context
         * @return A function for creating a new host object wrapper for the SkFont
         * class
         */
        static const jsi::HostFunctionType
        createCtor(std::shared_ptr<RNSkPlatformContext> context) {
            return JSI_HOST_FUNCTION_LAMBDA {
                // Return the newly constructed object
                return jsi::Object::createFromHostObject(
                        runtime, std::make_shared<JsiGrDirectContext>(std::move(context), context->makeGrDirectContext()));
            };
        }
    };

} // namespace RNSkia
