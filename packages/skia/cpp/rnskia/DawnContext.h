#pragma once

#include <memory>

#include "DawnUtils.h"
#include "DawnWindowContext.h"
#include "ImageProvider.h"

#include "include/gpu/graphite/BackendTexture.h"
#include "include/gpu/graphite/Context.h"
#include "include/gpu/graphite/ContextOptions.h"
#include "include/gpu/graphite/GraphiteTypes.h"
#include "include/gpu/graphite/Recorder.h"
#include "include/gpu/graphite/Recording.h"
#include "include/gpu/graphite/Surface.h"
#include "include/gpu/graphite/dawn/DawnBackendContext.h"
#include "include/gpu/graphite/dawn/DawnTypes.h"
#include "include/gpu/graphite/dawn/DawnUtils.h"

#include "src/gpu/graphite/ContextOptionsPriv.h"

namespace RNSkia {

class DawnContext {
public:
  // Delete copy constructor and assignment operator
  DawnContext(const DawnContext &) = delete;
  DawnContext &operator=(const DawnContext &) = delete;

  // Get instance for current thread
  static DawnContext &getInstance() {
    static DawnContext instance;
    return instance;
  }

  void submitRecording(skgpu::graphite::Recording *recording) {
    std::lock_guard<std::mutex> lock(_mutex);
    skgpu::graphite::InsertRecordingInfo info;
    info.fRecording = recording;
    fGraphiteContext->insertRecording(info);
    fGraphiteContext->submit(skgpu::graphite::SyncToCpu::kNo);
  }

  sk_sp<SkImage> MakeImageFromBuffer(void *buffer) {
    // TODO: implement
    return nullptr;
  }

  // Create offscreen surface
  sk_sp<SkSurface> MakeOffscreen(int width, int height) {
    SkImageInfo info =
        SkImageInfo::Make(width, height, DawnUtils::PreferedColorType, kPremul_SkAlphaType);
    sk_sp<SkSurface> skSurface = SkSurfaces::RenderTarget(getRecorder(), info);

    if (!skSurface) {
      throw std::runtime_error("Failed to create offscreen Skia surface.");
    }

    return skSurface;
  }

  // Create onscreen surface with window
  std::unique_ptr<WindowContext> MakeWindow(void *window, int width,
                                            int height) {
    // 1. Create Surface
    wgpu::SurfaceDescriptor surfaceDescriptor;
#ifdef __APPLE__
    wgpu::SurfaceDescriptorFromMetalLayer metalSurfaceDesc;
    metalSurfaceDesc.layer = window;
    surfaceDescriptor.nextInChain = &metalSurfaceDesc;
#elif __ANDROID__
    wgpu::SurfaceDescriptorFromAndroidNativeWindow androidSurfaceDesc;
    androidSurfaceDesc.window = window;
    surfaceDescriptor.nextInChain = &androidSurfaceDesc;
#endif
    auto surface =
        wgpu::Instance(instance->Get()).CreateSurface(&surfaceDescriptor);
    return std::make_unique<DawnWindowContext>(
        getRecorder(), backendContext.fDevice, surface, width, height);
  }

  void tick() { backendContext.fTick(backendContext.fInstance); }

private:
  std::unique_ptr<dawn::native::Instance> instance;
  std::unique_ptr<skgpu::graphite::Context> fGraphiteContext;
  skgpu::graphite::DawnBackendContext backendContext;
  std::mutex _mutex;

  DawnContext() {
    DawnProcTable backendProcs = dawn::native::GetProcs();
    dawnProcSetProcs(&backendProcs);
    WGPUInstanceDescriptor desc{};
    desc.features.timedWaitAnyEnable = true;
    instance = std::make_unique<dawn::native::Instance>(&desc);

    backendContext = DawnUtils::createDawnBackendContext(instance.get());

    skgpu::graphite::ContextOptions ctxOptions;
    skgpu::graphite::ContextOptionsPriv contextOptionsPriv;
    ctxOptions.fOptionsPriv = &contextOptionsPriv;
    ctxOptions.fOptionsPriv->fStoreContextRefInRecorder = true;
    fGraphiteContext =
        skgpu::graphite::ContextFactory::MakeDawn(backendContext, ctxOptions);

    if (!fGraphiteContext) {
      throw std::runtime_error("Failed to create graphite context");
    }
  }

  skgpu::graphite::Recorder *getRecorder() {
    static thread_local skgpu::graphite::RecorderOptions recorderOptions;
    static thread_local auto imageProvider = ImageProvider::Make();
    recorderOptions.fImageProvider = imageProvider;
    static thread_local auto recorder =
        fGraphiteContext->makeRecorder(recorderOptions);
        recorderOptions.fImageProvider = ImageProvider::Make();
    if (!recorder) {
      throw std::runtime_error("Failed to create graphite context");
    }
    return recorder.get();
  }
};

} // namespace RNSkia
