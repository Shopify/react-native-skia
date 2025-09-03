/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_SKIAMANAGER_H
#define HARMONY_SKIAMANAGER_H

#include "HarmonyPlatformContext.h"
#include <memory>
#include <rawfile/raw_file_manager.h>

namespace RNSkia {

class SkiaManager {
public:
    static SkiaManager &getInstance() {
        static SkiaManager instance;
        return instance;
    }

    void setContext(std::shared_ptr<RNSkia::HarmonyPlatformContext> context);

    std::shared_ptr<RNSkia::HarmonyPlatformContext> getContext();

    void setManager(std::shared_ptr<RNSkia::RNSkManager> manager);
    std::shared_ptr<RNSkia::RNSkManager> getManager();

    void setReleaseVideo(bool relv){
	isReleaseVideo = relv;
	}
    bool getReleaseVideo(){return isReleaseVideo;}
    
    static void *_pixels;
    struct Options {
        int width;
        int height;
        int stride;
        int pixelFormat;
        int alphaType;
    };
    static Options option ;
    static napi_value TagGetView(napi_env env, napi_callback_info info) {

        size_t argc = 6;
        napi_value args[6] = {nullptr};
        napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
        int32_t width;
        napi_get_value_int32(env, args[0], &width);

        int32_t height;
        napi_get_value_int32(env, args[1], &height);
        int32_t stride;
        napi_get_value_int32(env, args[2], &stride);

        int32_t pixelFormat;
        napi_get_value_int32(env, args[3], &pixelFormat);
        int32_t alphaType;
        napi_get_value_int32(env, args[4], &alphaType);
        option.height = height;
        option.width = width;
        option.pixelFormat = pixelFormat;
        option.alphaType = alphaType;
        option.stride = stride;

        OHOS::Media::OH_AccessPixels(env, args[5], &_pixels);

        DLOG(INFO) << "napi ok ,_pixels ok";
        return nullptr;
    }


private:
    SkiaManager() {}

    SkiaManager(const SkiaManager &) = delete;
    SkiaManager &operator=(const SkiaManager &) = delete;

    std::shared_ptr<RNSkia::HarmonyPlatformContext> platformContext;
    std::shared_ptr<RNSkia::RNSkManager> rnSkManager;
    
    bool isReleaseVideo = false;
};

} // namespace RNSkia

#endif // HARMONY_SVGVIEWMANAGER_H
