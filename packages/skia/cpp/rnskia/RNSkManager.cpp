#include "RNSkManager.h"

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "api/JsiSkApi.h"
#include "RNSkJsiViewApi.h"
#include "RNSkView.h"

#include "jsi/RuntimeAwareCache.h"

#ifdef SK_GRAPHITE
#include "RNDawnContext.h"
#include "rnwgpu/ArrayBuffer.h"
#include "rnwgpu/api/GPU.h"
#include "rnwgpu/api/GPUUncapturedErrorEvent.h"
#include "rnwgpu/api/ImageBitmap.h"
#include "rnwgpu/api/RNWebGPU.h"
#include "rnwgpu/api/descriptors/GPUBufferUsage.h"
#include "rnwgpu/api/descriptors/GPUColorWrite.h"
#include "rnwgpu/api/descriptors/GPUMapMode.h"
#include "rnwgpu/api/descriptors/GPUShaderStage.h"
#include "rnwgpu/api/descriptors/GPUTextureUsage.h"
#include "rnwgpu/api/WebGPUConstants.h"
#include "rnwgpu/async/RuntimeContext.h"
#include "jsi2/Promise.h"

#include "include/core/SkData.h"
#include "include/core/SkImage.h"
#include "include/core/SkImageInfo.h"
#endif

namespace RNSkia {
namespace jsi = facebook::jsi;

RNSkManager::RNSkManager(
    jsi::Runtime *jsRuntime,
    std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
    std::shared_ptr<RNSkPlatformContext> platformContext)
    : _jsRuntime(jsRuntime), _platformContext(platformContext),
      _jsCallInvoker(jsCallInvoker),
      _viewApi(std::make_shared<RNSkJsiViewApi>(platformContext)) {

  // Register main runtime (used by both Skia and WebGPU bindings)
  RNJsi::BaseRuntimeAwareCache::setMainJsRuntime(_jsRuntime);

  // Install bindings
  installBindings();
}

RNSkManager::~RNSkManager() {
  // Free up any references
  _viewApi = nullptr;
  _jsRuntime = nullptr;
  _platformContext = nullptr;
  _jsCallInvoker = nullptr;
}

void RNSkManager::registerSkiaView(size_t nativeId,
                                   std::shared_ptr<RNSkView> view) {
  _viewApi->registerSkiaView(nativeId, std::move(view));
}

void RNSkManager::unregisterSkiaView(size_t nativeId) {
  _viewApi->unregisterSkiaView(nativeId);
}

void RNSkManager::setSkiaView(size_t nativeId, std::shared_ptr<RNSkView> view) {
  _viewApi->setSkiaView(nativeId, std::move(view));
}

void RNSkManager::installBindings() {
  // Create the API objects and install it on the global object in the
  // provided runtime.
  auto skiaApi = std::make_shared<JsiSkApi>(_platformContext);
  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaApi",
      jsi::Object::createFromHostObject(*_jsRuntime, std::move(skiaApi)));

  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaViewApi",
      jsi::Object::createFromHostObject(*_jsRuntime, _viewApi));

#ifdef SK_GRAPHITE
  // Register the main runtime + its CallInvoker so spontaneous events
  // (device.lost / uncapturederror) on main-runtime devices can be delivered to
  // the JS thread without the ProcessEvents pump. Worklet-runtime devices have
  // no invoker (best-effort; see the RuntimeContext "Threading model" doc).
  rnwgpu::async::RuntimeContext::registerMainRuntime(_jsRuntime, _jsCallInvoker);

  // Install WebGPU constructors
  rnwgpu::GPU::installConstructor(*_jsRuntime);
  rnwgpu::GPUUncapturedErrorEvent::installConstructor(*_jsRuntime);
  // Create and expose navigator.gpu using DawnContext's instance
  auto &dawnContext = DawnContext::getInstance();
  auto gpu =
      std::make_shared<rnwgpu::GPU>(*_jsRuntime, dawnContext.getWGPUInstance());
  auto navigatorValue =
      _jsRuntime->global().getProperty(*_jsRuntime, "navigator");
  if (navigatorValue.isObject()) {
    auto navigator = navigatorValue.asObject(*_jsRuntime);
    navigator.setProperty(*_jsRuntime, "gpu",
                          rnwgpu::GPU::create(*_jsRuntime, gpu));
  } else {
    // Create navigator object if it doesn't exist
    jsi::Object navigator(*_jsRuntime);
    navigator.setProperty(*_jsRuntime, "gpu",
                          rnwgpu::GPU::create(*_jsRuntime, gpu));
    _jsRuntime->global().setProperty(*_jsRuntime, "navigator",
                                     std::move(navigator));
  }

  // Install WebGPU constant objects as plain JS objects on the main runtime.
  rnwgpu::installWebGPUConstants(*_jsRuntime);

  // Install a global `installWebGPU()` host function so worklet runtimes can get
  // the same constants. A host function captured into a worklet is serialized as
  // a SerializableHostFunction and re-created on the worklet runtime, so the body
  // runs there (its `rt` is the worklet runtime) and installs the constants on
  // that runtime. The constants come from the native wgpu::*Usage enums, so the
  // values stay a single source of truth across every runtime. Calling it on a
  // runtime that already has the globals is a safe, idempotent no-op.
  _jsRuntime->global().setProperty(
      *_jsRuntime, "installWebGPU",
      jsi::Function::createFromHostFunction(
          *_jsRuntime, jsi::PropNameID::forAscii(*_jsRuntime, "installWebGPU"),
          0,
          [](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
             const jsi::Value * /*args*/, size_t /*count*/) -> jsi::Value {
            rnwgpu::installWebGPUConstants(rt);
            return jsi::Value::undefined();
          }));

  // Install RNWebGPU global object for WebGPU Canvas support
  auto rnWebGPU = std::make_shared<rnwgpu::RNWebGPU>(gpu, nullptr);
  _jsRuntime->global().setProperty(
      *_jsRuntime, "RNWebGPU", rnwgpu::RNWebGPU::create(*_jsRuntime, rnWebGPU));

  // DRAFT — compile-unverified. Install the ImageBitmap constructor (so
  // `instanceof ImageBitmap` works) and a global createImageBitmap() that
  // accepts the non-standard encoded-BufferSource overload.
  //
  // The BufferSource is run through the shared rnwgpu::ArrayBuffer converter,
  // which validates byteOffset/byteLength against the backing buffer and throws
  // synchronously on a spoofed / out-of-bounds view — so createImageBitmap()
  // rejects rather than reading out of bounds (see ArrayBufferBounds /
  // ImageBitmapBounds specs). Decoding uses Skia's own codec; no platform image
  // decoder is needed.
  rnwgpu::ImageBitmap::installConstructor(*_jsRuntime);
  _jsRuntime->global().setProperty(
      *_jsRuntime, "createImageBitmap",
      jsi::Function::createFromHostFunction(
          *_jsRuntime,
          jsi::PropNameID::forAscii(*_jsRuntime, "createImageBitmap"), 1,
          [](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
             const jsi::Value *args, size_t count) -> jsi::Value {
            if (count < 1 || !args[0].isObject()) {
              throw jsi::JSError(
                  rt, "createImageBitmap requires a BufferSource argument");
            }
            // Only the encoded ArrayBuffer / ArrayBufferView overload is
            // supported here. Anything else (Blob, ImageData, …) is rejected.
            auto obj = args[0].getObject(rt);
            bool isBufferSource = obj.isArrayBuffer(rt);
            if (!isBufferSource && obj.hasProperty(rt, "buffer")) {
              auto bufferProp = obj.getProperty(rt, "buffer");
              isBufferSource =
                  bufferProp.isObject() &&
                  bufferProp.getObject(rt).isArrayBuffer(rt);
            }
            if (!isBufferSource) {
              throw jsi::JSError(rt, "createImageBitmap: unsupported source "
                                     "(expected an ArrayBuffer or TypedArray "
                                     "of encoded image bytes)");
            }
            // Validates bounds and THROWS synchronously on a spoofed view, so
            // the bad pointer never reaches the copy below.
            auto buffer =
                rnwgpu::JSIConverter<std::shared_ptr<rnwgpu::ArrayBuffer>>::
                    fromJSI(rt, args[0], false);
            // Copy the encoded bytes off the JS-owned ArrayBuffer.
            const uint8_t *bytes = buffer->data();
            std::vector<uint8_t> encoded(bytes, bytes + buffer->size());

            return rnwgpu::Promise::createPromise(
                rt, [encoded = std::move(encoded)](
                        jsi::Runtime &runtime,
                        std::shared_ptr<rnwgpu::Promise> promise) mutable {
                  auto skData =
                      SkData::MakeWithCopy(encoded.data(), encoded.size());
                  auto image = SkImages::DeferredFromEncodedData(skData);
                  if (image == nullptr) {
                    promise->reject(
                        "createImageBitmap: failed to decode image data");
                    return;
                  }
                  const int w = image->width();
                  const int h = image->height();
                  auto info =
                      SkImageInfo::Make(w, h, kRGBA_8888_SkColorType,
                                        kUnpremul_SkAlphaType);
                  std::vector<uint8_t> pixels(info.computeMinByteSize());
                  // nullptr context: decode/read on the CPU (raster).
                  if (!image->readPixels(nullptr, info, pixels.data(),
                                         info.minRowBytes(), 0, 0)) {
                    promise->reject(
                        "createImageBitmap: failed to read decoded pixels");
                    return;
                  }
                  auto bitmap = std::make_shared<rnwgpu::ImageBitmap>(
                      std::move(pixels), static_cast<size_t>(w),
                      static_cast<size_t>(h));
                  promise->resolve(
                      rnwgpu::ImageBitmap::create(runtime, bitmap));
                });
          }));
#endif
}
} // namespace RNSkia
