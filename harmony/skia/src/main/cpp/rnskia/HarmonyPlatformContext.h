/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_PLAT_FORM_CONTEXT_H
#define HARMONY_PLAT_FORM_CONTEXT_H

#include <memory>
#include <queue>
#include <rawfile/raw_file_manager.h>
#include <multimedia/image_framework/image_pixel_map_napi.h>

#include "HarmonyPlayLink.h"
#include "HarmonyBufferUtils.h"
#include "RNSkOpenGLCanvasProvider.h"
#include "RNSkPlatformContext.h"
#include "HarmonyOpenGLHelper.h" //OpenGL支撑文件
#include "RNSkManager.h"
#include "RNOH/ArkTSTurboModule.h"

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace react = facebook::react;


struct WriteData {
    std::vector<uint8_t> *responseData;
};


class HarmonyPlatformContext : public RNSkPlatformContext {
public:
    HarmonyPlatformContext(jsi::Runtime *runtime, std::shared_ptr<react::CallInvoker> callInvoker, float pixelDensity);

    ~HarmonyPlatformContext() override;

    void startDrawLoop() override;
    void stopDrawLoop() override;
    void runTaskOnMainThread();
    void SetStopRunOnMainThread();
    void runOnMainThread(std::function<void()>) override; // 运行在主线程上

    sk_sp<SkImage> takeScreenshotFromViewTag(size_t tag) override;   // 截图
    sk_sp<SkImage> makeImageFromNativeBuffer(void *buffer) override; // 从本地缓冲区创建图像

    uint64_t makeNativeBuffer(sk_sp<SkImage> image) override; // 创建本地缓冲区

    void releaseNativeBuffer(uint64_t pointer) override; // 释放本地缓冲区

    std::shared_ptr<RNSkVideo> createVideo(const std::string &url) override;

    void performStreamOperation(const std::string &sourceUri,
                                const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) override;

    void raiseError(const std::exception &err) override;

    sk_sp<SkSurface> makeOffscreenSurface(int width, int height) override;

    // static sk_sp<SkImage> makeImageFromHardwareBuffer(void *buffer, bool requireKnownFormat = false);

    static std::unique_ptr<WindowSurfaceHolder> makeWindowedSurface(OHNativeWindow *window, int width, int height) {
        return std::make_unique<WindowSurfaceHolder>(window, width, height);
    }

    sk_sp<SkFontMgr> createFontMgr() override;

    std::vector<uint8_t> ReadFileData(const std::string &sourceUri);
    
    std::vector<uint8_t> ReadAssetsData(const std::string &sourceUri);

    std::vector<uint8_t> PerformHTTPRequest(const std::string &sourceUri);

    static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp);

    uint32_t GetBufferFormatFromSkColorType(SkColorType bufferFormat);
    
    void setNativeResourceManager(const NativeResourceManager *nativeResMgr);
    
    void runOnDrawThread(std::function<void()> task);
    
    std::shared_ptr<rnoh::TurboModule> _TurboModule;
    std::shared_ptr<rnoh::RNInstance> _instance;
    facebook::jsi::Runtime *_runtime;
    bool Getview(size_t tag);

private:
    std::string DEFAULT_ASSETS_DEST = "assets/";
    // 绘制循环
    bool drawLoopActive = false;
    std::unique_ptr<PlayLink> playLink;
    std::queue<std::function<void()>> taskQueue;
    std::mutex taskMutex;
    std::condition_variable taskCond; // 线程间的同步和通知
    bool stopMainLoop = false;
    std::thread mainThread;
    const NativeResourceManager *nativeResourceManager;
};

} // namespace RNSkia

#endif // HARMONY_PLAT_FORM_CONTEXT_H