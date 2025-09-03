/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef NdkNativeWindow_NativeRender_H
#define NdkNativeWindow_NativeRender_H
#include "NativeImageAdaptor.h"
#include "RNSkHarmonyView.h"
#include <napi/native_api.h>
#include <ace/xcomponent/native_interface_xcomponent.h>
#include <native_buffer/native_buffer.h>
#include <native_window/external_window.h>
#include <glog/logging.h>

namespace RNSkia {
class NativeRender {
public:
    ~NativeRender() {}
    static NativeRender* GetInstance();
    static napi_value RegisterView(napi_env env, napi_callback_info info);

    static napi_value GetNativeRender(napi_env env, napi_callback_info info);
    static napi_value NapiOnDraw(napi_env env, napi_callback_info info);
    static napi_value NapiOnChangeScalingMode(napi_env env, napi_callback_info info);
    static void Release();
    bool Export(napi_env env, napi_value exports);
    void DrawBaseColor();
    void ChangeColor();
    void ChangeScalingMode();
    void SetNativeWindow(OHNativeWindow* nativeWindow, uint64_t width,  uint64_t height);
    NativeImageAdaptor *GetRender(std::string &id);

    std::shared_ptr<RNSkBaseHarmonyView> _harmonyView;

private:
    void NativeBufferApi();
    OH_NativeXComponent_Callback callback_;
    bool flag_ = false;
    bool flagFit_ = false;
    OHNativeWindow* nativeWindow_ = nullptr;
    uint64_t height_;
    uint64_t width_;

    std::unordered_map<std::string, OH_NativeXComponent *> m_nativeXComponentMap;
    std::unordered_map<std::string, NativeImageAdaptor *> m_pluginRenderMap;
};
}
#endif // NdkNativeWindow_NativeRender_H
