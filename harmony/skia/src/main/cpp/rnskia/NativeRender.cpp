/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "NativeRender.h"
#include <native_window/external_window.h>
#include <sys/mman.h>
#include "RNSkDomView.h"
#include "RNSkHarmonyView.h"
#include "common.h"
#include "SkiaManager.h"
#include "napi/n_func_arg.h"
// #include "IPCKit/ipc_cparcel.h"

namespace RNSkia {
void OnSurfaceCreatedCB_(OH_NativeXComponent *component, void *window) {
    if ((component == nullptr) || (window == nullptr)) {
        DLOG(ERROR) << "Callback OnSurfaceCreatedCB: component or window is null";
        return;
    }
    uint64_t width = 0;
    uint64_t height = 0;
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback OnSurfaceCreatedCB: Unable to get XComponent id";
        return;
    }

    std::string id(idStr);
    auto render = NativeRender::GetInstance()->GetRender(id);
    int32_t xSize = OH_NativeXComponent_GetXComponentSize(component, window, &width, &height);

    if ((xSize == OH_NATIVEXCOMPONENT_RESULT_SUCCESS) && (render != nullptr)) {
        OHNativeWindow *nativeWindow = (NativeWindow *)(window);
        NativeRender::GetInstance()->SetNativeWindow(nativeWindow, width, height);
        NativeRender::GetInstance()->DrawBaseColor();
        
        DLOG(INFO) << "Callback OnSurfaceCreatedCB surfaceAvailable finish";
    }
}

void OnSurfaceChangedCB_(OH_NativeXComponent *component, void *window) {
    (void)component;
    (void)window;
}

void OnSurfaceDestroyedCB_(OH_NativeXComponent *component, void *window) {
    if ((component == nullptr) || (window == nullptr)) {
        return;
    }
    NativeRender::Release();
}

NativeRender *NativeRender::GetInstance() {
    static NativeRender nativeRender;
    return &nativeRender;
}

void NativeRender::Release() {
    NativeRender *render = NativeRender::GetInstance();
    OH_NativeWindow_DestroyNativeWindow(render->nativeWindow_);
}

napi_value NativeRender::RegisterView(napi_env env, napi_callback_info info) {
    DLOG(INFO) << "napi RegisterView";
    // 获取参数
    NFuncArg funcArg(env, info);
    if (!funcArg.InitArgs(NARG_CNT::TWO)) {
        return nullptr;
    }
    napi_value v1 = funcArg.GetArg(NARG_POS::FIRST);
    NVal nValXcId(env, v1);
    auto [v1Succ, xComponentId, nLength] = nValXcId.ToUTF8String();
    if (!v1Succ) {
        DLOG(ERROR) << "napi RegisterView get xComponentId fail";
        return nullptr;
    }
    napi_value v2 = funcArg.GetArg(NARG_POS::SECOND);
    NVal nValNativeId(env, v2);
    auto [v2Succ, nativeId] = nValNativeId.ToInt32();
    if (!v2Succ) {
        DLOG(ERROR) << "napi RegisterView get nValNativeId fail";
        return nullptr;
    }
    DLOG(INFO) << "napi registerView xComponentId: " << xComponentId << " nativeId: " << nativeId;
    std::string id(xComponentId.get());

    if (NativeRender::GetInstance()->_harmonyView) {
        std::shared_ptr<RNSkView> rNSkView = NativeRender::GetInstance()->_harmonyView->getSkiaView();
        size_t nId = static_cast<size_t>(nativeId);
        SkiaManager::getInstance().getManager()->registerSkiaView(nId, rNSkView);
        DLOG(INFO) << "napi registerView finish";
        NativeRender::GetInstance()->_harmonyView->surfaceAvailable(NativeRender::GetInstance()->nativeWindow_, NativeRender::GetInstance()->width_, NativeRender::GetInstance()->height_);
    }
    return nullptr;
};

napi_value NativeRender::GetNativeRender(napi_env env, napi_callback_info info) {
    napi_status status;
    napi_value exports;
    size_t argc = 1;
    napi_value args[1] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (argc != 1) {
        napi_throw_type_error(env, NULL, "Wrong number of arguments");
        return nullptr;
    }
    napi_valuetype valuetype;
    status = napi_typeof(env, args[0], &valuetype);
    if (status != napi_ok) {
        return nullptr;
    }
    if (valuetype != napi_number) {
        napi_throw_type_error(env, NULL, "Wrong type of arguments");
        return nullptr;
    }
    return exports;
}

bool NativeRender::Export(napi_env env, napi_value exports) {
    napi_status status;

    napi_property_descriptor desc[] = {
        {"DrawColor", nullptr, NativeRender::NapiOnDraw, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"ChangeScalingMode", nullptr, NativeRender::NapiOnChangeScalingMode, nullptr, nullptr, nullptr, napi_default,
         nullptr},
    };
    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    callback_.OnSurfaceCreated = OnSurfaceCreatedCB_;
    callback_.OnSurfaceChanged = OnSurfaceChangedCB_;
    callback_.OnSurfaceDestroyed = OnSurfaceDestroyedCB_;

    napi_value exportInstance = nullptr;
    OH_NativeXComponent *nativeXComponent = nullptr;
    int32_t ret;
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;

    status = napi_get_named_property(env, exports, OH_NATIVE_XCOMPONENT_OBJ, &exportInstance);
    if (status != napi_ok) {
        return false;
    }

    status = napi_unwrap(env, exportInstance, reinterpret_cast<void **>(&nativeXComponent));
    if (status != napi_ok) {
        return false;
    }

    ret = OH_NativeXComponent_GetXComponentId(nativeXComponent, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return false;
    }

    std::string id(idStr);
    auto render = GetRender(id);
    if (render != nullptr) {
        auto result = render->Export(env, exports);

        if (result) {
            _harmonyView = std::make_shared<RNSkHarmonyView<RNSkia::RNSkDomView>>(SkiaManager::getInstance().getContext());
            size_t nid = _harmonyView->getSkiaView()->getNativeId();
        }
    }

    OH_NativeXComponent_RegisterCallback(nativeXComponent, &callback_);
    return true;
}

void NativeRender::SetNativeWindow(OHNativeWindow *nativeWindow, uint64_t width, uint64_t height) {
    nativeWindow_ = nativeWindow;
    height_ = height;
    width_ = width;
    int code = SET_BUFFER_GEOMETRY;
    int32_t bufferHeight = static_cast<int32_t>(height_ / 4);
    int32_t bufferWidth = static_cast<int32_t>(width_ / 2);
    OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, bufferWidth, bufferHeight);
}

napi_value NativeRender::NapiOnDraw(napi_env env, napi_callback_info info) {
    NativeRender::GetInstance()->ChangeColor();
    return nullptr;
}

napi_value NativeRender::NapiOnChangeScalingMode(napi_env env, napi_callback_info info) {
    NativeRender::GetInstance()->ChangeScalingMode();
    return nullptr;
}

void NativeRender::NativeBufferApi() {
    OH_NativeBuffer_Config config{
        .width = 0x100,
        .height = 0x100,
        .format = NATIVEBUFFER_PIXEL_FMT_RGBA_8888,
        .usage = NATIVEBUFFER_USAGE_CPU_READ | NATIVEBUFFER_USAGE_CPU_WRITE | NATIVEBUFFER_USAGE_MEM_DMA,
    };

    OH_NativeBuffer *nativeBuffer = OH_NativeBuffer_Alloc(&config);
    // Besides, you can directly create nativeWindowBuffer
    OHNativeWindowBuffer *nativeWindowBuffer = OH_NativeWindow_CreateNativeWindowBufferFromNativeBuffer(nativeBuffer);
    if (nativeWindowBuffer == nullptr) {
        return;
    }
    // Set colors pace to device, the hardware may not support this setting
    auto ret = OH_NativeBuffer_SetColorSpace(nativeBuffer, OH_COLORSPACE_SRGB_FULL);
    if (ret != 0) {
        return;
    }
}

static void TestReadWriteWindow(NativeWindow *nativeWindow) {
    //     OHIPCParcel *parcel = OH_IPCParcel_Create();
    //     if (parcel == nullptr) {
    //         LOGE("OH_IPCParcel_Create fail");
    //         return;
    //     }
    //     auto ret = OH_NativeWindow_WriteToParcel(nativeWindow, parcel);
    //     if (ret != 0) {
    //         LOGE("WriteToParcel fail, err code is %{public}d.", ret);
    //         return;
    //     }
    //     OHNativeWindow *readWindow = nullptr;
    //     ret = OH_NativeWindow_ReadFromParcel(parcel, &readWindow);
    //     if (ret != 0) {
    //         LOGE("ReadFromParcel fail, err code is %{public}d.", ret);
    //         return;
    //     }
    //     uint64_t nativeId = 0;
    //     uint64_t readId = 0;
    //     ret = OH_NativeWindow_GetSurfaceId(nativeWindow, &nativeId);
    //     ret &= OH_NativeWindow_GetSurfaceId(readWindow, &readId);
    //     if (ret != 0) {
    //         return;
    //     }
    //     DLOGI(INFO) << "TestReadWriteWindow window nativeId: " << nativeId << " readId: " << readId;
}

void NativeRender::DrawBaseColor() {
    NativeBufferApi();
    uint32_t value = flag_ ? 0xfff0000f : 0xff00ffff;
    uint64_t surfaceId = 0;
    auto ret = OH_NativeWindow_GetSurfaceId(nativeWindow_, &surfaceId);
    if (ret != 0) {
        return;
    }
    OHNativeWindow *nativeWindow = nullptr;
    ret = OH_NativeWindow_CreateNativeWindowFromSurfaceId(surfaceId, &nativeWindow);
    if (ret != 0) {
        return;
    }
    TestReadWriteWindow(nativeWindow);
    int fenceFd = -1;
    OHNativeWindowBuffer *nativeWindowBuffer = nullptr;
    ret = OH_NativeWindow_NativeWindowRequestBuffer(nativeWindow, &nativeWindowBuffer, &fenceFd);
    BufferHandle *bufferHandle = OH_NativeWindow_GetBufferHandleFromNative(nativeWindowBuffer);
    void *mappedAddr =
        mmap(bufferHandle->virAddr, bufferHandle->size, PROT_READ | PROT_WRITE, MAP_SHARED, bufferHandle->fd, 0);

    uint32_t *pixel = static_cast<uint32_t *>(mappedAddr);
    for (uint64_t x = 0; x < bufferHandle->width; x++) {
        for (uint64_t y = 0; y < bufferHandle->height; y++) {
            *pixel++ = value;
        }
    }
    struct Region *region = new Region();
    OH_NativeWindow_NativeWindowFlushBuffer(nativeWindow, nativeWindowBuffer, fenceFd, *region);
    if (munmap(mappedAddr, bufferHandle->size) < 0) {
        OH_NativeWindow_DestroyNativeWindow(nativeWindow);
        return;
    }
    OHNativeWindowBuffer *lastFlushedBuffer;
    int lastFlushedFenceFd;
    float matrix[16];
    ret = OH_NativeWindow_GetLastFlushedBuffer(nativeWindow, &lastFlushedBuffer, &lastFlushedFenceFd, matrix);
    if (ret != 0) {
        OH_NativeWindow_DestroyNativeWindow(nativeWindow);
        return;
    }
    BufferHandle *lastHandle = OH_NativeWindow_GetBufferHandleFromNative(lastFlushedBuffer);
    if (lastHandle != nullptr && bufferHandle != nullptr && lastHandle->virAddr != bufferHandle->virAddr) {
    }

    OH_NativeWindow_DestroyNativeWindow(nativeWindow);
}

void NativeRender::ChangeColor() {
    flag_ = !flag_;
    DrawBaseColor();
}

void NativeRender::ChangeScalingMode() {
    flagFit_ = !flagFit_;
    if (flagFit_) {
        OH_NativeWindow_NativeWindowSetScalingModeV2(nativeWindow_, OH_SCALING_MODE_SCALE_FIT_V2);
    } else {
        OH_NativeWindow_NativeWindowSetScalingModeV2(nativeWindow_, OH_SCALING_MODE_SCALE_CROP_V2);
    }

    DrawBaseColor();
}

NativeImageAdaptor *NativeRender::GetRender(std::string &id) {
    if (m_pluginRenderMap.find(id) == m_pluginRenderMap.end()) {
        NativeImageAdaptor *instance = NativeImageAdaptor::GetInstance();
        m_pluginRenderMap[id] = instance;
        return instance;
    }
    return m_pluginRenderMap[id];
}

} // namespace RNSkia