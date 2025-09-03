/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include <cstddef>
#include <cstdint>
#include <hilog/log.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <string>


#include "RNSkDomView.h"
#include "RNSkHarmonyView.h"
#include "common.h"
#include "plugin_manager.h"
#include "plugin_render.h"
#include <native_window/external_window.h>


namespace RNSkia {
std::unordered_map<std::string,std::shared_ptr<PluginRender>>PluginRender::m_instance;
PluginRender::PluginRender(std::shared_ptr<RNSkia::RNSkPlatformContext> context)
{
    _context = context;
    _harmonyView = std::make_shared<RNSkHarmonyView<RNSkia::RNSkDomView>>(context);
}


std::shared_ptr<PluginRender>PluginRender::GetInstance(std::string &id) {
    if (m_instance.find(id) == m_instance.end()) {
        auto instance = std::make_shared<PluginRender>(SkiaManager::getInstance().getContext());
        m_instance[id] = instance;
        return instance;
    } else {
        return m_instance[id];
    }
}


void OnSurfaceCreatedCB(OH_NativeXComponent *component, void *window) 
{
    DLOG(INFO) << "Callback OnSurfaceCreatedCB";
    if ((component == nullptr) || (window == nullptr)) {
        DLOG(ERROR) << "Callback OnSurfaceCreatedCB: component or window is null";
        return;
    }
    
    
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback OnSurfaceCreatedCB: Unable to get XComponent id";
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    uint64_t width;
    uint64_t height;
    int32_t xSize = OH_NativeXComponent_GetXComponentSize(component, window, &width, &height);

    if ((xSize == OH_NATIVEXCOMPONENT_RESULT_SUCCESS) && (render != nullptr)) {
        DLOG(INFO) << "Callback OnSurfaceCreatedCB window=" << window;
        OHNativeWindow *nativeWindow = static_cast<OHNativeWindow *>(window);
        DLOG(INFO) << "Callback OnSurfaceCreatedCB nativeWindow=" << nativeWindow;
        render->m_width = width;
        render->m_height = height;
        render->m_window = nativeWindow;

        DLOG(INFO) << "Callback OnSurfaceCreatedCB finish";
    }
}

void OnSurfaceChangedCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback OnSurfaceChangedCB";
    if ((component == nullptr) || (window == nullptr)) {
        DLOG(ERROR) << "Callback OnSurfaceChangedCB: component or window is null";
        return;
    }

    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback OnSurfaceChangedCB: Unable to get XComponent id";
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnSurfaceChanged(component, window);
        DLOG(INFO) << "Callback OnSurfaceChangedCB finish";
    }
}

void OnSurfaceDestroyedCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback OnSurfaceDestroyedCB";
    if ((component == nullptr) || (window == nullptr)) {
        DLOG(ERROR) << "Callback OnSurfaceDestroyedCB: component or window is null";
        return;
    }
    DLOG(INFO) << "Callback OnSurfaceDestroyedCB window=" << window;
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback OnSurfaceDestroyedCB: Unable to get XComponent id";
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        SkiaManager::getInstance().setReleaseVideo(true);
        render->_harmonyView->surfaceDestroyed();
        PluginRender::Release(id);
        DLOG(INFO) << "Callback OnSurfaceDestroyedCB finish id: " << id;
    }
}

/**
 * 释放相关环境资源方法
 * @param id
 */
void PluginRender::Release(std::string &id)
{
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        m_instance.erase(m_instance.find(id));
    }
}

void DispatchTouchEventCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback DispatchTouchEventCB";
    if ((component == nullptr) || (window == nullptr)) {
        DLOG(ERROR) << "Callback DispatchTouchEventCB: component or window is null";
        return;
    }

    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback DispatchTouchEventCB: Unable to get XComponent id";
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnTouchEvent(component, window);
    }
}

void DispatchMouseEventCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback DispatchMouseEventCB";
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    int32_t ret = OH_NativeXComponent_GetXComponentId(component, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnMouseEvent(component, window);
    }
}
// 悬停事件
void DispatchHoverEventCB(OH_NativeXComponent *component, bool isHover) {
    DLOG(INFO) << "Callback DispatchHoverEventCB";
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    int32_t ret = OH_NativeXComponent_GetXComponentId(component, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnHoverEvent(component, isHover);
    }
}
// 对焦事件
void OnFocusEventCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback OnFocusEventCB";
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    int32_t ret = OH_NativeXComponent_GetXComponentId(component, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnFocusEvent(component, window);
    }
}
// 模糊事件
void OnBlurEventCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback OnBlurEventCB";
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    int32_t ret = OH_NativeXComponent_GetXComponentId(component, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnBlurEvent(component, window);
    }
}
// 按键事件
void OnKeyEventCB(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "Callback OnKeyEventCB";
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    int32_t ret = OH_NativeXComponent_GetXComponentId(component, idStr, &idSize);
    if (ret != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        return;
    }
    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    if (render != nullptr) {
        render->OnKeyEvent(component, window);
    }
}

void PluginRender::OnSurfaceChanged(OH_NativeXComponent *component, void *window) {
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback OnSurfaceChanged: Unable to get XComponent id";
        return;
    }

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    double offsetX;
    double offsetY;
    OH_NativeXComponent_GetXComponentOffset(component, window, &offsetX, &offsetY);
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "OH_NativeXComponent_GetXComponentOffset",
                 "offsetX = %{public}lf, offsetY = %{public}lf", offsetX, offsetY);
    uint64_t width;
    uint64_t height;
    OH_NativeXComponent_GetXComponentSize(component, window, &width, &height);
    if (render != nullptr) {
        render->_harmonyView->surfaceSizeChanged(width, height);
    }
}

void PluginRender::OnTouchEvent(OH_NativeXComponent *component, void *window) {
    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(component, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "Callback DispatchTouchEventCB: Unable to get XComponent id";
        return;
    }
    OH_NativeXComponent_TouchEvent touchEvent;
    OH_NativeXComponent_GetTouchEvent(component, window, &touchEvent);

    float tiltX = 0.0f;
    float tiltY = 0.0f;
    OH_NativeXComponent_TouchPointToolType toolType =
        OH_NativeXComponent_TouchPointToolType::OH_NATIVEXCOMPONENT_TOOL_TYPE_UNKNOWN;
    OH_NativeXComponent_GetTouchPointToolType(component, 0, &toolType);
    OH_NativeXComponent_GetTouchPointTiltX(component, 0, &tiltX);
    OH_NativeXComponent_GetTouchPointTiltY(component, 0, &tiltY);

    std::string id(idStr);
    auto render = PluginRender::GetInstance(id);
    RNSkTouchInfo info;
    std::vector<RNSkTouchInfo> touches;
    if (render != nullptr && touchEvent.type == OH_NativeXComponent_TouchEventType::OH_NATIVEXCOMPONENT_UP) {
        info.x = tiltX;
        info.y = tiltY;
        touches.push_back(info);
        render->_harmonyView->updateTouchPoints(touches);
    }
}

void PluginRender::RegisterCallback(OH_NativeXComponent *nativeXComponent) {
    m_renderCallback.OnSurfaceCreated = OnSurfaceCreatedCB;
    m_renderCallback.OnSurfaceChanged = OnSurfaceChangedCB;
    m_renderCallback.OnSurfaceDestroyed = OnSurfaceDestroyedCB;
    m_renderCallback.DispatchTouchEvent = DispatchTouchEventCB;
    OH_NativeXComponent_RegisterCallback(nativeXComponent, &m_renderCallback);

    m_mouseCallback.DispatchMouseEvent = DispatchMouseEventCB;
    m_mouseCallback.DispatchHoverEvent = DispatchHoverEventCB;
    OH_NativeXComponent_RegisterMouseEventCallback(nativeXComponent, &m_mouseCallback);

    OH_NativeXComponent_RegisterFocusEventCallback(nativeXComponent, OnFocusEventCB);
    OH_NativeXComponent_RegisterKeyEventCallback(nativeXComponent, OnKeyEventCB);
    OH_NativeXComponent_RegisterBlurEventCallback(nativeXComponent, OnBlurEventCB);
}

void PluginRender::OnMouseEvent(OH_NativeXComponent *component, void *window) {
    DLOG(INFO) << "PluginRender OnMouseEvent";
    OH_NativeXComponent_MouseEvent mouseEvent;
    int32_t ret = OH_NativeXComponent_GetMouseEvent(component, window, &mouseEvent);
    if (ret == OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "PluginRender",
                     "MouseEvent Info: x = %{public}f, y = %{public}f, action = %{public}d, button = %{public}d",
                     mouseEvent.x, mouseEvent.y, mouseEvent.action, mouseEvent.button);
    } else {
        DLOG(ERROR) << "PluginRender GetMouseEvent error";
    }
}

void PluginRender::OnHoverEvent(OH_NativeXComponent *component, bool isHover) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "PluginRender", "OnHoverEvent isHover_ = %{public}d", isHover);
}

void PluginRender::OnFocusEvent(OH_NativeXComponent *component, void *window) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "PluginRender", "OnFocusEvent");
}

void PluginRender::OnBlurEvent(OH_NativeXComponent *component, void *window) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "PluginRender", "OnBlurEvent");
}

void PluginRender::OnKeyEvent(OH_NativeXComponent *component, void *window) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "PluginRender", "OnKeyEvent");

    OH_NativeXComponent_KeyEvent *keyEvent = nullptr;
    if (OH_NativeXComponent_GetKeyEvent(component, &keyEvent) >= 0) {
        OH_NativeXComponent_KeyAction action;
        OH_NativeXComponent_GetKeyEventAction(keyEvent, &action);
        OH_NativeXComponent_KeyCode code;
        OH_NativeXComponent_GetKeyEventCode(keyEvent, &code);
        OH_NativeXComponent_EventSourceType sourceType;
        OH_NativeXComponent_GetKeyEventSourceType(keyEvent, &sourceType);
        int64_t deviceId;
        OH_NativeXComponent_GetKeyEventDeviceId(keyEvent, &deviceId);
        int64_t timeStamp;
        OH_NativeXComponent_GetKeyEventTimestamp(keyEvent, &timeStamp);
        OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "PluginRender",
                     "KeyEvent Info: action=%{public}d, code=%{public}d, sourceType=%{public}d, deviceId=%{public}ld, "
                     "timeStamp=%{public}ld",
                     action, code, sourceType, deviceId, timeStamp);
    } else {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "PluginRender", "GetKeyEvent error");
    }
}


} // namespace RNSkia
