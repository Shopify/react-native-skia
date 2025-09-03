/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef NATIVE_XCOMPONENT_PLUGIN_RENDER_H
#define NATIVE_XCOMPONENT_PLUGIN_RENDER_H

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <cstddef>
#include <napi/native_api.h>

#include "napi/n_func_arg.h"
#include <rawfile/raw_file_manager.h>
#include <string>
#include <unordered_map>

#include "RNSkHarmonyView.h"
#include "RNSkPlatformContext.h"

#include "SkiaManager.h"

namespace RNSkia {

class PluginRender {
public:
    PluginRender(std::shared_ptr<RNSkia::RNSkPlatformContext> context);
    ~PluginRender() {
        m_window = nullptr;
    }
    static std::shared_ptr<PluginRender> GetInstance(std::string &id);
    static void Release(std::string &id);

    void OnSurfaceChanged(OH_NativeXComponent *component, void *window);
    void OnTouchEvent(OH_NativeXComponent *component, void *window);
    void OnMouseEvent(OH_NativeXComponent *component, void *window);
    void OnHoverEvent(OH_NativeXComponent *component, bool isHover);
    void OnFocusEvent(OH_NativeXComponent *component, void *window);
    void OnBlurEvent(OH_NativeXComponent *component, void *window);
    void OnKeyEvent(OH_NativeXComponent *component, void *window);
    void RegisterCallback(OH_NativeXComponent *nativeXComponent);


    static napi_value RegisterView(napi_env env, napi_callback_info info) {
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
        DLOG(INFO) << "napi RegisterView xComponentId: " << xComponentId << " nativeId: " << nativeId;
        std::string id(xComponentId.get());
        if (m_instance.find(id) != m_instance.end()) {
            auto instance = m_instance[id];
            instance->_context->runOnMainThread(
                [instance = std::move(instance), nativeId = std::move(nativeId), id = std::move(id)]() {
                    auto view = instance->_harmonyView;
                    std::shared_ptr<RNSkView> rNSkView = view->getSkiaView();
                    size_t nId = static_cast<size_t>(nativeId);
                    SkiaManager::getInstance().getManager()->registerSkiaView(nId, rNSkView);
                    view->surfaceAvailable(instance->m_window, 1, 1);
                    DLOG(INFO) << "napi RegisterView finish XComponentId: " << id
                               << " threadId: " << std::this_thread::get_id();
                });
        }
        return nullptr;
    };

    static napi_value DropInstance(napi_env env, napi_callback_info info) {
        DLOG(INFO) << "napi DropInstance";
        // 获取参数
        NFuncArg funcArg(env, info);
        if (!funcArg.InitArgs(NARG_CNT::TWO)) {
            return nullptr;
        }
        napi_value v1 = funcArg.GetArg(NARG_POS::FIRST);
        NVal nValXcId(env, v1);
        auto [v1Succ, xComponentId, nLength] = nValXcId.ToUTF8String();
        if (!v1Succ) {
            DLOG(ERROR) << "napi DropInstance get xComponentId fail";
            return nullptr;
        }
        napi_value v2 = funcArg.GetArg(NARG_POS::SECOND);
        NVal nValNativeId(env, v2);
        auto [v2Succ, nativeId] = nValNativeId.ToInt32();
        if (!v2Succ) {
            DLOG(ERROR) << "napi DropInstance get nValNativeId fail";
            return nullptr;
        }
        DLOG(INFO) << "napi DropInstance xComponentId: " << xComponentId << " nativeId: " << nativeId << " m_instance: " << m_instance.size();
        std::string id(xComponentId.get());
        if (m_instance.find(id) != m_instance.end()) {
            auto instance = m_instance[id];
            size_t nId = static_cast<size_t>(nativeId);
            SkiaManager::getInstance().getManager()->setSkiaView(nId, nullptr);
            SkiaManager::getInstance().getManager()->unregisterSkiaView(nId);
            instance->_harmonyView->viewDidUnmount();
            DLOG(INFO) << "napi DropInstance finish XComponentId: " << id
                       << " threadId: " << std::this_thread::get_id();
            //             instance->_context->runOnMainThread(
            //                 [instance = std::move(instance), nativeId = std::move(nativeId), id = std::move(id)]() {
            //                     size_t nId = static_cast<size_t>(nativeId);
            //                     SkiaManager::getInstance().getManager()->setSkiaView(nId, nullptr);
            //                     SkiaManager::getInstance().getManager()->unregisterSkiaView(nId);
            //                     instance->_harmonyView->viewDidUnmount();
            //                     DLOG(INFO) << "napi DropInstance finish XComponentId: " << id
            //                                << " threadId: " << std::this_thread::get_id();
            //                 });
        }
        return nullptr;
    }

    static napi_value SetModeAndDebug(napi_env env, napi_callback_info info) {
        DLOG(INFO) << "napi SetModeAndDebug";
        // 获取参数
        NFuncArg funcArg(env, info);
        if (!funcArg.InitArgs(NARG_CNT::THREE)) {
            DLOG(ERROR) << "napi SetModeAndDebug param not match";
            return nullptr;
        }
        napi_value v1 = funcArg.GetArg(NARG_POS::FIRST);
        NVal nXComponentId(env, v1);
        auto [v1Succ, xComponentId, nIdLength] = nXComponentId.ToUTF8String();
        if (!v1Succ) {
            DLOG(ERROR) << "napi SetModeAndDebug get xComponentId fail";
            return nullptr;
        }
        napi_value v2 = funcArg.GetArg(NARG_POS::SECOND);
        NVal nMode(env, v2);
        auto [v2Succ, mode, nModeLength] = nMode.ToUTF8String();
        if (!v2Succ) {
            DLOG(ERROR) << "napi SetModeAndDebug get mode fail";
            return nullptr;
        }
        napi_value v3 = funcArg.GetArg(NARG_POS::THIRD);
        NVal nShowDebug(env, v3);
        auto [v3Succ, showDebug] = nShowDebug.ToBool();
        if (!v3Succ) {
            DLOG(ERROR) << "napi SetModeAndDebug get showDebug fail";
            return nullptr;
        }
        std::string id(xComponentId.get());
        std::string modeStr(mode.get());
        DLOG(INFO) << "napi SetModeAndDebug xComponentId: " << id << " mode: " << modeStr
                   << " showDebug: " << showDebug;
        if (m_instance.find(id) != m_instance.end()) {
            auto instance = m_instance[id];
            auto view = instance->_harmonyView;
            view->setMode(modeStr);
            view->setShowDebugInfo(showDebug);
            DLOG(INFO) << "napi SetModeAndDebug finish XComponentId: " << id
                       << " threadId: " << std::this_thread::get_id();
        }
        return nullptr;
    }

    static napi_value SurfaceSizeChanged(napi_env env, napi_callback_info info) {
        DLOG(INFO) << "napi SurfaceSizeChanged";
        // 获取参数
        NFuncArg funcArg(env, info);
        if (!funcArg.InitArgs(NARG_CNT::FOUR)) {
            DLOG(ERROR) << "napi SurfaceSizeChanged param not match";
            return nullptr;
        }
        napi_value v1 = funcArg.GetArg(NARG_POS::FIRST);
        NVal nValXcId(env, v1);
        auto [v1Succ, xComponentId, nLength] = nValXcId.ToUTF8String();
        if (!v1Succ) {
            DLOG(ERROR) << "napi SurfaceSizeChanged get xComponentId fail";
            return nullptr;
        }
        napi_value v2 = funcArg.GetArg(NARG_POS::SECOND);
        NVal nValNativeId(env, v2);
        auto [v2Succ, nativeId] = nValNativeId.ToInt32();
        if (!v2Succ) {
            DLOG(ERROR) << "napi SurfaceSizeChanged get nValNativeId fail";
            return nullptr;
        }
        napi_value v3 = funcArg.GetArg(NARG_POS::THIRD);
        NVal nWidth(env, v3);
        auto [v3Succ, width] = nWidth.ToInt32();
        if (!v3Succ) {
            DLOG(ERROR) << "napi SurfaceSizeChanged get nWidth fail";
            return nullptr;
        }
        napi_value v4 = funcArg.GetArg(NARG_POS::FOURTH);
        NVal nHeight(env, v4);
        auto [v4Succ, height] = nHeight.ToInt32();
        if (!v4Succ) {
            DLOG(ERROR) << "napi SurfaceSizeChanged get nHeight fail";
            return nullptr;
        }
        DLOG(INFO) << "napi SurfaceSizeChanged xComponentId: " << xComponentId << " nativeId: " << nativeId
                   << " width: " << width << " height: " << height;
        std::string id(xComponentId.get());
        if (m_instance.find(id) != m_instance.end()) {
            auto instance = m_instance[id];
            instance->_context->runOnMainThread(
                [instance = std::move(instance), nativeId = std::move(nativeId), id = std::move(id)]() {
                    auto view = instance->_harmonyView;
                    std::shared_ptr<RNSkView> rNSkView = view->getSkiaView();
                    size_t nId = static_cast<size_t>(nativeId);
                    SkiaManager::getInstance().getManager()->registerSkiaView(nId, rNSkView);
                    view->surfaceSizeChanged(instance->m_width, instance->m_height);
                    DLOG(INFO) << "napi SurfaceSizeChanged finish XComponentId: " << id
                               << " threadId: " << std::this_thread::get_id();
                });
        }
        return nullptr;
    }

public:
    static std::unordered_map<std::string, std::shared_ptr<PluginRender>> m_instance;
    OHNativeWindow *m_window;
    uint64_t m_width;
    uint64_t m_height;

    std::shared_ptr<RNSkBaseHarmonyView> _harmonyView;
    std::shared_ptr<RNSkia::RNSkPlatformContext> _context;

private:
    OH_NativeXComponent_Callback m_renderCallback;
    OH_NativeXComponent_MouseEvent_Callback m_mouseCallback;
};
} // namespace RNSkia
#endif // NATIVE_XCOMPONENT_PLUGIN_RENDER_H
