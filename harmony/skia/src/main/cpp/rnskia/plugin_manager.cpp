/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "plugin_manager.h"

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <cstdint>
#include <hilog/log.h>
#include <string>
#include "common.h"
#include "plugin_render.h"

namespace RNSkia {

PluginManager PluginManager::m_pluginManager;

PluginManager::~PluginManager() {
    DLOG(INFO) << "~PluginManager";
    for (auto iter = m_nativeXComponentMap.begin(); iter != m_nativeXComponentMap.end(); ++iter) {
        if (iter->second != nullptr) {
            delete iter->second;
            iter->second = nullptr;
        }
    }
    m_nativeXComponentMap.clear();
    m_pluginRenderMap.clear();
}

void PluginManager::Export(napi_env env, napi_value exports) {
    if ((env == nullptr) || (exports == nullptr)) {
        DLOG(ERROR) << "PluginManager Export: env or exports is null";
        return;
    }

    napi_value exportInstance = nullptr;
    if (napi_get_named_property(env, exports, OH_NATIVE_XCOMPONENT_OBJ, &exportInstance) != napi_ok) {
        DLOG(ERROR) << "PluginManager Export: napi_get_named_property fail";
        return;
    }

    OH_NativeXComponent *nativeXComponent = nullptr;
    if (napi_unwrap(env, exportInstance, reinterpret_cast<void **>(&nativeXComponent)) != napi_ok) {
        DLOG(ERROR) << "PluginManager Export: napi_unwrap fail";
        return;
    }

    char idStr[OH_XCOMPONENT_ID_LEN_MAX + 1] = {'\0'};
    uint64_t idSize = OH_XCOMPONENT_ID_LEN_MAX + 1;
    if (OH_NativeXComponent_GetXComponentId(nativeXComponent, idStr, &idSize) != OH_NATIVEXCOMPONENT_RESULT_SUCCESS) {
        DLOG(ERROR) << "PluginManager Export: OH_NativeXComponent_GetXComponentId fail";
        return;
    }

    std::string id(idStr);
    this->id = id;
    DLOG(INFO) << "PluginManager Export: XComponentId: " << id;
    auto context = PluginManager::GetInstance();
    if ((context != nullptr) && (nativeXComponent != nullptr)) {
        context->SetNativeXComponent(id, nativeXComponent);
        auto render = context->GetRender(id);
        if (render != nullptr) {
            render->RegisterCallback(nativeXComponent);
        }
    }
}

void PluginManager::SetNativeXComponent(std::string &id, OH_NativeXComponent *nativeXComponent) {
    if (nativeXComponent == nullptr) {
        return;
    }

    if (m_nativeXComponentMap.find(id) == m_nativeXComponentMap.end()) {
        m_nativeXComponentMap[id] = nativeXComponent;
        return;
    }

    if (m_nativeXComponentMap[id] != nativeXComponent) {
        OH_NativeXComponent *tmp = m_nativeXComponentMap[id];
        m_nativeXComponentMap[id] = nativeXComponent;
    }
}


std::shared_ptr<PluginRender>PluginManager::GetRender(std::string &id) {
    if (m_pluginRenderMap.find(id) == m_pluginRenderMap.end()) {
        auto instance = PluginRender::GetInstance(id);

        m_pluginRenderMap[id] = instance;
        
        return m_pluginRenderMap[id];
    }

    return m_pluginRenderMap[id];
}


std::shared_ptr<PluginRender>PluginManager::GetRender(){
    return GetRender(id);
}
} // namespace RNSkia