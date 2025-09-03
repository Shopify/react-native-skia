/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef NATIVE_XCOMPONENT_PLUGIN_MANAGER_H
#define NATIVE_XCOMPONENT_PLUGIN_MANAGER_H

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <napi/native_api.h>
#include <string>
#include <unordered_map>

#include "plugin_render.h"

namespace RNSkia {
class PluginManager {
public:
    ~PluginManager();

    static PluginManager *GetInstance() { return &PluginManager::m_pluginManager; }

    void SetNativeXComponent(std::string &id, OH_NativeXComponent *nativeXComponent);

    std::shared_ptr<PluginRender>GetRender(std::string &id);
    std::shared_ptr<PluginRender>GetRender();
    
    void Export(napi_env env, napi_value exports);
    
    OHNativeWindow *m_window;

private:
    static PluginManager m_pluginManager;

    std::unordered_map<std::string, OH_NativeXComponent *> m_nativeXComponentMap;
    std::unordered_map<std::string,std::shared_ptr<PluginRender>>m_pluginRenderMap;
    std::string id;
};
} // namespace RNSkia
#endif // NATIVE_XCOMPONENT_PLUGIN_MANAGER_H
