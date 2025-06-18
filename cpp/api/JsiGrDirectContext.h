#pragma once

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkSurface.h"
#include "RNSkLog.h"


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/ganesh/GrDirectContext.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiGrDirectContext : public JsiSkHostObject {
public:
    /**
     *  Return the current GPU resource cache limit in bytes.
     */
    JSI_HOST_FUNCTION(getResourceCacheLimit) {
        auto grContext = getContext()->getDirectContext();

        return (int) grContext->getResourceCacheLimit();
    }

    /**
    *  Gets the current GPU resource cache usage.
    *
    *  @param resourceCount If non-null, returns the number of resources that are held in the
    *                       cache.
    *  @param maxResourceBytes If non-null, returns the total number of bytes of video memory held
    *                          in the cache.
    */
    JSI_HOST_FUNCTION(getResourceCacheUsageCount) {
        auto grContext = getContext()->getDirectContext();
        int resourceCount;

        grContext->getResourceCacheUsage(&resourceCount, nullptr);

        return resourceCount;
    }

    JSI_HOST_FUNCTION(getResourceCacheUsageBytes) {
        auto grContext = getContext()->getDirectContext();
        size_t resourceBytes;

        grContext->getResourceCacheUsage(nullptr, &resourceBytes);

        return (int) resourceBytes;
    }
 
    /**
    *  Gets the number of bytes in the cache consumed by purgeable (e.g. unlocked) resources.
    */
    JSI_HOST_FUNCTION(getResourceCachePurgableBytes) {
        auto grContext = getContext()->getDirectContext();
        return (int) grContext->getResourceCachePurgeableBytes();
    }
 
 
    /**
    *  Specify the GPU resource cache limit. If the cache currently exceeds this limit,
    *  it will be purged (LRU) to keep the cache within the limit.
    *
    *  @param maxResourceBytes The maximum number of bytes of video memory
    *                          that can be held in the cache.
    */
    JSI_HOST_FUNCTION(setResourceCacheLimit) {
        auto grContext = getContext()->getDirectContext();
        size_t maxResourceBytes = arguments[0].asNumber();

        RNSkLogger::logToConsole("cache limit is %d", (int) maxResourceBytes); 

        grContext->setResourceCacheLimit(maxResourceBytes);

        return jsi::Value::undefined();
    }
 
    /**
    * Frees GPU created by the context. Can be called to reduce GPU memory
    * pressure.
    */
    JSI_HOST_FUNCTION(freeGpuResources) {
        auto grContext = getContext()->getDirectContext();

        grContext->freeGpuResources();

        return jsi::Value::undefined();
    } 

    static const jsi::HostFunctionType
    createCtor(std::shared_ptr<RNSkPlatformContext> context) {
        return JSI_HOST_FUNCTION_LAMBDA {
            return jsi::Object::createFromHostObject(
                runtime, std::make_shared<JsiGrDirectContext>(std::move(context)));
        };
    }

    EXPORT_JSI_API_TYPENAME(JsiGrDirectContext, GrDirectContext)

    JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiGrDirectContext, getResourceCacheLimit),
                         JSI_EXPORT_FUNC(JsiGrDirectContext, getResourceCacheUsageCount),
                         JSI_EXPORT_FUNC(JsiGrDirectContext, getResourceCacheUsageBytes),
                         JSI_EXPORT_FUNC(JsiGrDirectContext, getResourceCachePurgableBytes),
                         JSI_EXPORT_FUNC(JsiGrDirectContext, setResourceCacheLimit),
                         JSI_EXPORT_FUNC(JsiGrDirectContext, freeGpuResources))

    JsiGrDirectContext(std::shared_ptr<RNSkPlatformContext> context)
    : JsiSkHostObject(std::move(context)) {

    }


};
}
