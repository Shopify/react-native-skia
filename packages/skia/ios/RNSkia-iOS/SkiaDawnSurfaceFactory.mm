#import "SkiaDawnSurfaceFactory.h"

#import <MetalKit/MetalKit.h>

#include "webgpu/webgpu_cpp.h"
#include "dawn/native/DawnNative.h"

#include "include/gpu/graphite/mtl/MtlBackendContext.h"
#include "include/gpu/graphite/mtl/MtlGraphiteTypes.h"
#include "include/gpu/graphite/mtl/MtlGraphiteUtils.h"

sk_sp<SkSurface> SkiaDawnSurfaceFactory::makeOffscreenSurface(int width, int height) {
	id<MTLDevice> device = MTLCreateSystemDefaultDevice();
  //  auto queue = [*device newCommandQueue];

    skgpu::graphite::MtlBackendContext backendContext = {};
//    backendContext.fDevice.retain((CFTypeRef)device);
//    backendContext.fQueue.retain((CFTypeRef)device);

    //fDisplayParams.fGraphiteTestOptions.fTestOptions.fContextOptions.fDisableCachedGlyphUploads =
     //       true;
    // Needed to make synchronous readPixels work:
   // fDisplayParams.fGraphiteTestOptions.fPriv.fStoreContextRefInRecorder = true;
    // fGraphiteContext = skgpu::graphite::ContextFactory::MakeMetal(
    //         backendContext, fDisplayParams.fGraphiteTestOptions.fTestOptions.fContextOptions);
    // fGraphiteRecorder = fGraphiteContext->makeRecorder(ToolUtils::CreateTestingRecorderOptions());
	return nullptr;
}
