#import "SkiaDawnSurfaceFactory.h"

#import <Metal/Metal.h>

#include "webgpu/webgpu_cpp.h"
#include "dawn/native/DawnNative.h"

#include "include/gpu/graphite/Context.h"
#include "include/gpu/graphite/ContextOptions.h"

#include "include/gpu/graphite/mtl/MtlBackendContext.h"
#include "include/gpu/graphite/mtl/MtlGraphiteTypes.h"
#include "include/gpu/graphite/mtl/MtlGraphiteUtils.h"

sk_sp<SkSurface> SkiaDawnSurfaceFactory::makeOffscreenSurface(int width, int height) {
	sk_cfp<id<MTLDevice>> device;
	device.reset(MTLCreateSystemDefaultDevice());

	//skgpu::graphite::MtlBackendContext backendContext = {};
	//backendContext.fDevice.retain(device.get());
	//backendContext.fQueue.reset([*device newCommandQueue]);
	return nullptr;
}
