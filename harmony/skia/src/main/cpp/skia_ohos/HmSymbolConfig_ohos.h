/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef LIB_HW_SYMBOL_CONFIG_H_
#define LIB_HW_SYMBOL_CONFIG_H_

#include <unordered_map>
#include <mutex>
#include <json/include/json.h>

#include "include/core/SkStream.h"
#include "include/core/SkString.h"
#include "include/core/SkTypes.h"
#include "HMSymbol.h"

class SK_API HmSymbolConfig_OHOS
{
public:
    static HmSymbolConfig_OHOS* GetInstance();

    SymbolLayersGroups GetSymbolLayersGroups(uint32_t glyphId);
    SymbolLayersGroups GetSymbolLayersGroups(uint16_t glyphId);

    std::vector<std::vector<PiecewiseParameter>> GetGroupParameters(AnimationType type, uint16_t groupSum,
        uint16_t animationMode = 0, CommonSubType commonSubType = CommonSubType::DOWN);

    int ParseConfigOfHmSymbol(const char* fname, SkString fontDir);

    bool GetHmSymbolEnable();

    bool GetInit() const
    {
        return isInit_;
    }

    void SetInit(const bool init)
    {
        isInit_ = init;
    }

    void Lock()
    {
        hmSymbolMut_.lock();
    }

    void Unlock()
    {
        hmSymbolMut_.unlock();
    }

    void Clear()
    {
        hmSymbolConfig_.clear();
        animationInfos_.clear();
        isInit_ = false;
    }

private:
    std::unordered_map<uint16_t, SymbolLayersGroups> hmSymbolConfig_;
    std::unordered_map<AnimationType, AnimationInfo> animationInfos_;
    std::mutex hmSymbolMut_;
    bool isInit_ = false;

    const uint32_t defaultColorHexLen = 9;
    const uint32_t defaultColorStrLen = 7;
    const uint32_t hexFlag = 16;
    const uint32_t twoBytesBitsLen = 16;
    const uint32_t oneByteBitsLen = 8;

    int CheckConfigFile(const char* fname, Json::Value& root);

    uint32_t EncodeAnimationAttribute(uint16_t groupSum, uint16_t animationMode, CommonSubType commonSubType);

    void ParseSymbolAnimations(const Json::Value& root,
        std::unordered_map<AnimationType, AnimationInfo>* animationInfos);
    void ParseSymbolAnimationParas(const Json::Value& root,
        std::map<uint32_t, AnimationPara>& animationParas);
    void ParseSymbolAnimationPara(const Json::Value& root, AnimationPara& animationPara);
    void ParseSymbolGroupParas(const Json::Value& root, std::vector<std::vector<PiecewiseParameter>>& groupParameters);
    void ParseSymbolPiecewisePara(const Json::Value& root, PiecewiseParameter& piecewiseParameter);
    void ParseSymbolCurveArgs(const Json::Value& root, std::map<std::string, float>& curveArgs);
    void ParseSymbolProperties(const Json::Value& root, std::map<std::string, std::vector<float>>& properties);

    void ParseSymbolLayersGrouping(const Json::Value& root);
    void ParseOneSymbol(const Json::Value& root, std::unordered_map<uint16_t, SymbolLayersGroups>* hmSymbolConfig);
    void ParseLayers(const Json::Value& root, std::vector<std::vector<size_t>>& layers);
    void ParseRenderModes(const Json::Value& root, std::map<SymbolRenderingStrategy,
        std::vector<RenderGroup>>& renderModesGroups);
    void ParseComponets(const Json::Value& root, std::vector<size_t>& components);
    void ParseRenderGroups(const Json::Value& root, std::vector<RenderGroup>& renderGroups);
    void ParseGroupIndexes(const Json::Value& root, std::vector<GroupInfo>& groupInfos);
    void ParseLayerOrMaskIndexes(const Json::Value& root, std::vector<size_t>& indexes);
    void ParseDefaultColor(const char* defaultColorStr, RenderGroup& renderGroup);
    void ParseAnimationSettings(const Json::Value& root, std::vector<AnimationSetting>& animationSettings);
    void ParseAnimationSetting(const Json::Value& root, AnimationSetting& animationSetting);
    void ParseAnimationType(const std::string& animationTypeStr, AnimationType& animationType);
    void ParseAnimationTypes(const Json::Value& root, std::vector<AnimationType>& animationTypes);
    void ParseGroupSettings(const Json::Value& root, std::vector<GroupSetting>& groupSettings);
    void ParseGroupSetting(const Json::Value& root, GroupSetting& groupSetting);
    void ParseSymbolCommonSubType(const char* subTypeStr, CommonSubType& commonSubType);

    void ParseOneSymbolNativeCase(const char* key, const Json::Value& root, SymbolLayersGroups& symbolLayersGroups,
        uint16_t& nativeGlyphId);
    void ParseOneSymbolLayerCase(const char* key, const Json::Value& root, SymbolLayersGroups& symbolLayersGroups);
    void ParseOneSymbolRenderCase(const char* key, const Json::Value& root, SymbolLayersGroups& symbolLayersGroups);
    void ParseOneSymbolAnimateCase(const char* key, const Json::Value& root, SymbolLayersGroups& symbolLayersGroups);
};

#endif