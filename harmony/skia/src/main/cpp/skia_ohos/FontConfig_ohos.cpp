/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "FontConfig_ohos.h"
#include "hilog/log.h"
#include<array>
#include <dirent.h>
#include <libgen.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <cstring>

// #include "securec.h"

#include "include/core/SkFontStyle.h"
#include "include/core/SkString.h"

using namespace ErrorCode;

const bool G_IS_HMSYMBOL_ENABLE = HmSymbolConfig_OHOS::GetInstance()->GetHmSymbolEnable();

static const char* OHOS_DEFAULT_CONFIG = "/system/etc/fontconfig.json";
/*! Constructor
 * \param fontScanner the scanner to get the font information from a font file
 * \param fname the full name of system font configuration document.
 *     \n The default value is '/system/etc/fontconfig.json', if fname is given null
 */
FontConfig_OHOS::FontConfig_OHOS(const SkFontScanner& fontScanner,
    const char* fname)
{
    int err = parseConfig(fname);
    if (err != NO_ERROR) {
        return;
    }
    scanFonts(fontScanner);
    resetGenericValue();
    resetFallbackValue();
}

/*! To get the fallbackForMap
 *  \return The reference of fallbackForMap
 */
const FallbackForMap& FontConfig_OHOS::getFallbackForMap() const
{
    return fallbackForMap;
}

/*! To get the fallback set
 *  \return The reference of fallbackSet
 */
const FallbackSet& FontConfig_OHOS::getFallbackSet() const
{
    return fallbackSet;
}

/*! To get the count of font style sets supported in the system
 *  \return The count of font style sets in generic family
 */
int FontConfig_OHOS::getFamilyCount() const
{
    return genericFamilySet.size();
}

/*! To get the family name of the default font style set
 *  \param[out] familyName a pointer of SkString object, to which the family value will be set.
 *  \return The count of typeface in this font style set
 *  \n Return -1, if there is no any font style set in the system.
 */
int FontConfig_OHOS::getDefaultFamily(SkString* familyName) const
{
    return getFamilyName(0, familyName);
}

/*! To get the family name of a font style set
 * \param index the index of a font style set in generic family
 * \param[out] familyName a pointer of SkString object, to which the family value will be set
 * \return The count of typeface in the font style set
 * \n      Return -1, if the 'index' is out of range
 */
int FontConfig_OHOS::getFamilyName(int index, SkString* familyName) const
{
    if (index < 0 || index >= this->getFamilyCount()) {
        if (familyName) {
            familyName->reset();
        }
        return -1;
    }
    if (familyName) {
        *familyName = genericFamilySet[index]->familyName;
    }
    return genericFamilySet[index]->typefaceSet->size();
}

/*! To get the count of a font style set
 * \param styleIndex the index of a font style set
 * \param isFallback to indicate the font style set is from generic family or fallback family
 * \n                 false , the font style set is from generic family list
 * \n                 true, the font style set is from fallback family list
 * \return The count of typeface in the font style set
 */
int FontConfig_OHOS::getTypefaceCount(int styleIndex, bool isFallback) const
{
    if (styleIndex < 0) {
        return -1;
    }
    if (isFallback) {
        if ((unsigned int)styleIndex < fallbackSet.size()) {
            return fallbackSet[styleIndex]->typefaceSet->size();
        }
    } else {
        if ((unsigned int)styleIndex < genericFamilySet.size()) {
            return genericFamilySet[styleIndex]->typefaceSet->size();
        }
    }
    return -1;
}

/*! To get a typeface
 * \param styleIndex the index of a font style set
 * \param index the index of a typeface in its style set
 * \param isFallback false, the font style set is generic
 * \n          true, the font style set is fallback
 * \return The pointer of a typeface
 * \n       Return null, if 'styleIndex' or 'index' is out of range
 */
SkTypeface_OHOS* FontConfig_OHOS::getTypeface(int styleIndex, int index,
    bool isFallback) const
{
    if (styleIndex < 0 || index < 0 ||
        (isFallback && (unsigned int)styleIndex >= fallbackSet.size()) ||
        (!isFallback && (unsigned int)styleIndex >= genericFamilySet.size())) {
        return nullptr;
    }
    if (isFallback) {
        const TypefaceSet& tpSet = *(fallbackSet[styleIndex]->typefaceSet.get());
        if ((unsigned int)index < tpSet.size()) {
            return tpSet[index].get();
        }
    } else {
        const TypefaceSet& tpSet = *(genericFamilySet[styleIndex]->typefaceSet.get());
        if ((unsigned int)index < tpSet.size()) {
            return tpSet[index].get();
        }
    }
    return nullptr;
}

/*! To get a typeface
 * \param styleIndex the index a font style set
 * \param style the font style to be matching
 * \param isFallback false, the font style set is generic
 * \n                true, the font style set is fallback
 * \return An object of typeface whose font style is the closest matching to 'style'
 * \n      Return null, if 'styleIndex' is out of range
 */
SkTypeface_OHOS* FontConfig_OHOS::getTypeface(int styleIndex, const SkFontStyle& style,
    bool isFallback) const
{
    if (styleIndex < 0 ||
        (isFallback && (unsigned int)styleIndex >= fallbackSet.size()) ||
        (!isFallback && (unsigned int)styleIndex >= genericFamilySet.size())) {
        return nullptr;
    }
    const TypefaceSet* pSet = nullptr;
    if (isFallback) {
        pSet = fallbackSet[styleIndex]->typefaceSet.get();
    } else {
        pSet = genericFamilySet[styleIndex]->typefaceSet.get();
    }
    sk_sp<SkTypeface_OHOS> tp = matchFontStyle(*pSet, style);
    return tp.get();
}

/*! To get the index of a font style set
 *  \param familyName the family name of the font style set
 *  \n     get the index of default font style set, if 'familyName' is null
 *  \param[out] isFallback to tell if the family is from generic or fallback to the caller.
 *  \n          isFallback is false, if the font style is from generic family list
 *  \n          isFallback is true, if the font style is from fallback family list
 *  \return The index of the font style set
 *  \n      Return -1, if 'familyName' is not found in the system
 */
int FontConfig_OHOS::getStyleIndex(const char* familyName, bool& isFallback) const
{
    if (familyName == nullptr) {
        isFallback = false;
        return 0;
    }

    std::lock_guard<std::mutex> lock(fontMutex);
    if (genericNames.count() == 0) {
        return -1;
    }

    SkString fname(familyName);
    int* p = genericNames.find(fname);
    if (p) {
        isFallback = false;
        return *p;
    } else {
        if (fallbackNames.count() == 0) {
            return -1;
        }

        p = fallbackNames.find(fname);
        if (p) {
            isFallback = true;
            return *p;
        }
    }
    return -1;
}

/*! Find the closest matching typeface
 * \param typefaceSet a typeface set belonging to the same font style set
 * \param pattern the font style to be matching
 * \return The typeface object which is the closest matching to 'pattern'
 * \n      Return null, if the count of typeface is 0
 */
sk_sp<SkTypeface_OHOS> FontConfig_OHOS::matchFontStyle(const TypefaceSet& typefaceSet,
    const SkFontStyle& pattern)
{
    int count = typefaceSet.size();
    if (count == 1) {
        return typefaceSet[0];
    }
    sk_sp<SkTypeface_OHOS> res = nullptr;
    uint32_t minDiff = 0xFFFFFFFF;
    for (int i = 0; i < count; i++) {
        const SkFontStyle& fontStyle = typefaceSet[i]->fontStyle();
        uint32_t diff = getFontStyleDifference(pattern, fontStyle);
        if (diff < minDiff) {
            minDiff = diff;
            res = typefaceSet[i];
        }
    }
    return res;
}

/*! To get the difference between a font style and the matching font style
 * \param dstStyle the style to be matching
 * \param srcStyle a font style
 * \return The difference value of a specified style with the matching style
 */
uint32_t FontConfig_OHOS::getFontStyleDifference(const SkFontStyle& dstStyle,
    const SkFontStyle& srcStyle)
{
    int normalWidth = SkFontStyle::kNormal_Width;
    int dstWidth = dstStyle.width();
    int srcWidth = srcStyle.width();

    uint32_t widthDiff = 0;
    // The maximum font width is kUltraExpanded_Width i.e. '9'.
    // If dstWidth <= kNormal_Width (5), first check narrower values, then wider values.
    // If dstWidth > kNormal_Width, first check wider values, then narrower values.
    // When dstWidth and srcWidth are at different side of kNormal_Width,
    // the width difference between them should be more than 5 (9/2+1)
    if (dstWidth <= normalWidth) {
        if (srcWidth <= dstWidth) {
            widthDiff = dstWidth - srcWidth;
        } else {
            widthDiff = srcWidth - dstWidth + 5;
        }
    } else {
        if (srcWidth >= dstWidth) {
            widthDiff = srcWidth - dstWidth;
        } else {
            widthDiff = dstWidth - srcWidth + 5;
        }
    }

    int diffSlantValue[3][3] = {
        {0, 2, 1},
        {2, 0, 1},
        {2, 1, 0}
    };
    uint32_t slantDiff = diffSlantValue[dstStyle.slant()][srcStyle.slant()];

    int dstWeight = dstStyle.weight();
    int srcWeight = srcStyle.weight();
    uint32_t weightDiff = 0;

    // The maximum weight is kExtraBlack_Weight (1000), when dstWeight and srcWeight are at the different
    // side of kNormal_Weight, the weight difference between them should be more than 500 (1000/2)
    if ((dstWeight == SkFontStyle::kNormal_Weight && srcWeight == SkFontStyle::kMedium_Weight) ||
        (dstWeight == SkFontStyle::kMedium_Weight && srcWeight == SkFontStyle::kNormal_Weight)) {
        weightDiff = 50;
    } else if (dstWeight <= SkFontStyle::kNormal_Weight) {
        if (srcWeight <= dstWeight) {
            weightDiff = dstWeight - srcWeight;
        } else {
            weightDiff = srcWeight - dstWeight + 500;
        }
    } else if (dstWeight > SkFontStyle::kNormal_Weight) {
        if (srcWeight >= dstWeight) {
            weightDiff = srcWeight - dstWeight;
        } else {
            weightDiff = dstWeight - srcWeight + 500;
        }
    }
    // The first 2 bytes to save weight difference, the third byte to save slant difference,
    // and the fourth byte to save width difference
    uint32_t diff = (widthDiff << 24) + (slantDiff << 16) + weightDiff;
    return diff;
}

/*! To get the data of font configuration file
 * \param fname the full name of the font configuration file
 * \param[out] size the size of data returned to the caller
 * \return The pointer of content of the file
 * \note The returned pointer should be freed by the caller
 */
char* FontConfig_OHOS::getFileData(const char* fname, int& size)
{
    FILE* fp = fopen(fname, "r");
    if (fp == nullptr) {
        return nullptr;
    }
    fseek(fp, 0L, SEEK_END);
    size = ftell(fp) + 1;
    rewind(fp);
    void* data = malloc(size);
    if (data == nullptr) {
        fclose(fp);
        return nullptr;
    }
//     memset_s(data, size, 0, size);
    memset(data, 0 ,size);
    (void) fread(data, size, 1, fp);
    fclose(fp);
    return (char*)data;
}

/*! parse the system font configuration document
 * \param fname the full name of the font configuration document
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_NOT_FOUND config document is not found
 * \return ERROR_CONFIG_FORMAT_NOT_SUPPORTED config document format is not supported
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE wrong type of value in the configuration
 */
int FontConfig_OHOS::parseConfig(const char* fname)
{
    if (fname == nullptr) {
        fname = OHOS_DEFAULT_CONFIG;
    }
    Json::Value root;
    int err = checkConfigFile(fname, root);
    if (err != NO_ERROR) {
        return err;
    }
    // "fontdir" - optional, the data type should be string
    const char* key = "fontdir";
    if (root.isMember(key)) {
        if (root[key].isArray()) {
            parseFontDir(fname, root[key]);
        } else {
            return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key);
        }
    }
    // "generic", "fallback" - necessary, the data type should be array
    const char* keys[] = {"generic", "fallback", nullptr};
    int index = 0;
    while (true) {
        if (keys[index] == nullptr) {
            break;
        }
        key = keys[index++];
        if (!root.isMember(key)) {
            return logErrInfo(ERROR_CONFIG_MISSING_TAG, key);
        } else if (!root[key].isArray()) {
            return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::arrayValue, root[key].type());
        }
        const Json::Value& arr = root[key];
        for (unsigned int i = 0; i < arr.size(); i++) {
            if (arr[i].isObject()) {
                if (!strcmp(key, "generic")) {
                    parseGeneric(arr[i]);
                } else if (!strcmp(key, "fallback")) {
                    parseFallback(arr[i]);
                }
            } else {
                SkString errKey;
                errKey.appendf("%s#%d", key, i + 1);
                (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, errKey.c_str(),
                    Json::objectValue, arr[i].type());
            }
        }
    }
    root.clear();
    return NO_ERROR;
}

/*! check the system font configuration document
 * \param fname the full name of the font configuration document
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_NOT_FOUND config document is not found
 * \return ERROR_CONFIG_FORMAT_NOT_SUPPORTED config document format is not supported
 */
int FontConfig_OHOS::checkConfigFile(const char* fname, Json::Value& root)
{
    int size = 0;
    char* data = getFileData(fname, size);
    if (data == nullptr) {
        return logErrInfo(ERROR_CONFIG_NOT_FOUND, fname);
    }
    JSONCPP_STRING errs;
    Json::CharReaderBuilder charReaderBuilder;
    std::unique_ptr<Json::CharReader> jsonReader(charReaderBuilder.newCharReader());
    bool isJson = jsonReader->parse(data, data + size, &root, &errs);
    free((void*)data);
    data = nullptr;

    if (!isJson || !errs.empty()) {
        return logErrInfo(ERROR_CONFIG_FORMAT_NOT_SUPPORTED, fname);
    }
    return NO_ERROR;
}
#if ENABLE_DEBUG
/*! To print out the font information
 * \param font the font object to be printed
 */
void FontConfig_OHOS::dumpFont(const FontInfo& font) const
{
    LOGI("name=%s, family=%s, weight=%d, width=%d, slant=%d, index=%d",
        font.fname.c_str(), font.familyName.c_str(), font.style.weight(), font.style.width(), font.style.slant(),
        font.index);
    int count = font.axisSet.axis.size();
    if (count > 0) {
        SkString str;
        for (unsigned int i = 0; i < count; i++) {
            str.appendU32(SkFixedFloorToInt(font.axisSet.axis[i]));
            if (i < count - 1) {
                str.append(",");
            }
        }
        LOGI("axis={%s}\n", str.c_str());
    }
}

/*! To print out the information of generic font style set
 */
void FontConfig_OHOS::dumpGeneric() const
{
    LOGI("\n");
    for (unsigned int i = 0; i < genericFamilySet.size(); i++) {
        LOGI("[%d] familyName : %s - %d\n", i, genericFamilySet[i]->familyName.c_str(),
            static_cast<int>(genericFamilySet[i]->typefaceSet->size()));
        for (int j = 0; j < genericFamilySet[i]->typefaceSet->size(); j++) {
            if ((*(genericFamilySet[i]->typefaceSet))[j].get()) {
                const FontInfo* font = (*(genericFamilySet[i]->typefaceSet))[j]->getFontInfo();
                if (font) {
                    dumpFont(*font);
                } else {
                    LOGE("font [%d] is null\n", j);
                }
            } else {
                LOGE("typefeace [%d] is null\n", j);
            }
        }
    }
}

/*! To print out the information of fallback font style set
 */
void FontConfig_OHOS::dumpFallback() const
{
    LOGI("\n");
    int count = 0;
    fallbackForMap.foreach([this, &count](const SkString& key,
        const FallbackSetPos& setIndex) {
        LOGI("[%d] family : %s - %d\n", count++, key.c_str(), setIndex.count);
        for (unsigned int i = setIndex.index; i < setIndex.index + setIndex.count; i++) {
            const TypefaceSet& tpSet = *(fallbackSet[i]->typefaceSet.get());
            LOGI("[%s] - %d\n", fallbackSet[i]->familyName.c_str(), static_cast<int>(tpSet.size()));

            for (unsigned int j = 0; j < tpSet.size(); j++) {
                const FontInfo* font = tpSet[j]->getFontInfo();
                if (font) {
                    this->dumpFont(*font);
                } else {
                    LOGE("font [%d] is null\n", j);
                }
            }
        }
    });
}
#endif

/*! To parse 'fontdir' attribute
 * \param root the root node of 'fontdir'
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type
 */
int FontConfig_OHOS::parseFontDir(const char* fname, const Json::Value& root)
{
    for (unsigned int i = 0; i < root.size(); i++) {
        if (root[i].isString()) {
            const char* dir;
#if defined(SK_BUILD_FONT_MGR_FOR_PREVIEW_WIN) or defined(SK_BUILD_FONT_MGR_FOR_PREVIEW_MAC) or \
    defined(SK_BUILD_FONT_MGR_FOR_PREVIEW_LINUX)
            if (strcmp(fname, OHOS_DEFAULT_CONFIG) == 0) {
                dir = strcmp(root[i].asCString(), "/system/fonts/") ? root[i].asCString() : "fonts";
            } else {
                dir = strcmp(root[i].asCString(), "/system/fonts/") ? root[i].asCString() : "../../../../hms/previewer/resources/fonts";
            }
#else
            dir = root[i].asCString();
#endif
            fontDirSet.emplace_back(SkString(dir));
        } else {
            SkString text;
            text.appendf("fontdir#%d", i + 1);
            return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, text.c_str(), Json::stringValue, root[i].type());
        }
    }
    return NO_ERROR;
}

/*! To parse an item of 'generic' family
 * \param root the root node of an item in 'generic' list
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 * \return ERROR_CONFIG_MISSING_TAG missing tag of 'family' or 'alias'
 */
int FontConfig_OHOS::parseGeneric(const Json::Value& root)
{
    // "family" - necessary, the data type should be String
    const char* key = "family";
    if (!root.isMember(key)) {
        return logErrInfo(ERROR_CONFIG_MISSING_TAG, key);
    } else if (!root[key].isString()) {
        return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::stringValue, root[key].type());
    }
    SkString familyName = SkString(root[key].asCString());
    // "alias" - necessary, the data type should be Array
    if (!root.isMember("alias")) {
        return logErrInfo(ERROR_CONFIG_MISSING_TAG, "alias");
    }
    // "adjust", "variation" - optional
    const char* tags[] = {"alias", "adjust", "variations", "index"};
    std::vector<AliasInfo> aliasSet;
    std::vector<AdjustInfo> adjustSet;
    std::vector<VariationInfo> variationSet;
    for (unsigned int i = 0; i < sizeof(tags) / sizeof(char*); i++) {
        key = tags[i];
        if (!root.isMember(key)) {
            continue;
        }
        if (root[key].isArray()) {
            if (!strcmp(key, "index")) {
                parseTtcIndex(root[key], familyName);
                continue;
            }
            const Json::Value& arr = root[key];
            for (unsigned int j = 0; j < arr.size(); j++) {
                if (arr[j].isObject()) {
                    if (!strcmp(key, "alias")) {
                        parseAlias(arr[j], aliasSet);
                    } else if (!strcmp(key, "adjust")) {
                        parseAdjust(arr[j], adjustSet);
                    } else {
                        parseVariation(arr[j], variationSet);
                    }
                } else {
                    SkString text;
                    text.appendf("%s#%d", key, j + 1);
                    (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, text.c_str(), Json::objectValue,
                        arr[j].type());
                }
            }
        } else {
            (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::arrayValue, root[key].type());
        }
        if (root.size() == 2) {
            break;
        }
    }
    if (aliasSet.size()) {
        aliasMap.set(SkString(familyName), aliasSet);
    }
    if (adjustSet.size()) {
        adjustMap.set(SkString(familyName), adjustSet);
    }
    if (variationSet.size()) {
        variationMap.set(SkString(familyName), variationSet);
    }
    return NO_ERROR;
}

/*! To parse an item of 'alias' attribute
 * \param root the root node of an item in an 'alias' list
 * \param[out] aliasSet the value of AliasInfo will be written to and returned to the caller
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 * \return ERROR_CONFIG_MISSING_TAG missing tag of alias name
 */
int FontConfig_OHOS::parseAlias(const Json::Value& root, std::vector<AliasInfo>& aliasSet)
{
    if (root.empty()) {
        return logErrInfo(ERROR_CONFIG_MISSING_TAG, "generic-alias-name");
    }
    Json::Value::Members members = root.getMemberNames();
    const char* key = members[0].c_str();
    if (!root[key].isInt()) {
        return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, "generic-alias-weight",
            Json::intValue, root[key].type());
    }

    SkString aliasName = SkString(key);
    int weight = root[key].asInt();
    std::unique_ptr<GenericFamily> genericFamily = std::make_unique<GenericFamily>();
    genericFamily->familyName = SkString(key);
    if (aliasSet.size() == 0 || weight > 0) {
        genericFamily->typefaceSet = std::make_shared<TypefaceSet>();
    } else {
        int index = aliasSet[0].pos;
        genericFamily->typefaceSet = genericFamilySet[index]->typefaceSet;
    }
    auto typeset = genericFamily->typefaceSet.get();
    genericNames.set(SkString(genericFamily->familyName), genericFamilySet.size());
    OH_LOG_ERROR(LOG_APP, "cyjskia_________cyj_______genericFamily %{private}d",(*typeset).size());
    AliasInfo info = {static_cast<int>(genericFamilySet.size()), weight};
    aliasSet.emplace_back(std::move(info));
    genericFamilySet.emplace_back(std::move(genericFamily));
    return NO_ERROR;
}

/*! To parse an item of 'adjust' attribute
 * \param root the root node of an item in an 'adjust' list
 * \param[out] adjustSet the value of AdjustInfo will be written to and returned to the caller
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 * \return ERROR_CONFIG_MISSING_TAG missing tag of 'weight' or 'to'
 */
int FontConfig_OHOS::parseAdjust(const Json::Value& root, std::vector<AdjustInfo>& adjustSet)
{
    const char* tags[] = {"weight", "to"};
    int values[2]; // value[0] - to save 'weight', value[1] - to save 'to'
    for (unsigned int i = 0; i < sizeof(tags) / sizeof(char*); i++) {
        const char* key = tags[i];
        if (!root.isMember(key)) {
            return logErrInfo(ERROR_CONFIG_MISSING_TAG, key);
        } else if (!root[key].isInt()) {
            return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key,
                Json::intValue, root[key].type());
        } else {
            values[i] = root[key].asInt();
        }
    }
    AdjustInfo info = {values[0], values[1]};
    adjustSet.push_back(info);
    return NO_ERROR;
}

/*! To parse an item of 'fallback' attribute
 * \param root the root node of an item in 'fallback' list
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 * \return ERROR_CONFIG_MISSING_TAG missing tag of fallbackFor
 */
int FontConfig_OHOS::parseFallback(const Json::Value& root)
{
    if (root.empty()) {
        return logErrInfo(ERROR_CONFIG_MISSING_TAG, "fallback-fallbackFor");
    }
    Json::Value::Members members = root.getMemberNames();
    const char* key = members[0].c_str();
    if (!root[key].isArray()) {
        return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, "fallback-items",
            Json::arrayValue, root[key].type());
    }
    unsigned int startPos = fallbackSet.size();
    SkString fallbackFor = SkString(key);
    const Json::Value& fallbackArr = root[key];
    for (unsigned int i = 0; i < fallbackArr.size(); i++) {
        if (!fallbackArr[i].isObject()) {
            SkString text;
            text.appendf("fallback-%s#%d", key, i + 1);
            (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, text.c_str(), Json::objectValue,
                fallbackArr[i].type());
            continue;
        }
        parseFallbackItem(fallbackArr[i]);
    }
    FallbackSetPos setPos = {startPos, (unsigned int)(fallbackSet.size() - startPos)};
    fallbackForMap.set(fallbackFor, setPos);
    return NO_ERROR;
}

/*! To parse an item of fallback family
 * \param root the root node of a fallback item
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 * \return ERROR_CONFIG_MISSING_TAG missing tag of language
 */
int FontConfig_OHOS::parseFallbackItem(const Json::Value& root)
{
    if (root.empty()) {
        return logErrInfo(ERROR_CONFIG_MISSING_TAG, "fallback-item-lang");
    }
    Json::Value::Members members = root.getMemberNames();
    const char* key = nullptr;
    bool hasIndex = false;
    bool hasVariations = false;
    for (unsigned int i = 0; i < members.size(); i++) {
        if (members[i] == "variations") {
            hasVariations = true;
        } else if (members[i] == "index") {
            hasIndex = true;
        } else {
            key = members[i].c_str();
        }
    }
    if (key == nullptr) {
        return logErrInfo(ERROR_CONFIG_MISSING_TAG, "fallback-item-lang");
    }
    if (!root[key].isString()) {
        return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, "fallback-item-family",
            Json::stringValue, root[key].type());
    }
    SkString lang = SkString(key);
    SkString familyName = SkString(root[key].asCString());
    if (hasVariations) {
        key = "variations";
        if (root[key].isArray()) {
            const Json::Value& varArr = root[key];
            std::vector<VariationInfo> variationSet;
            for (unsigned int i = 0; i < varArr.size(); i++) {
                if (varArr[i].isObject()) {
                    parseVariation(varArr[i], variationSet);
                } else {
                    SkString text = SkString("variations#");
                    text.appendU32(i + 1);
                    (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, text.c_str(),
                        Json::objectValue, varArr[i].type());
                }
            }
            if (variationSet.size()) {
                variationMap.set(SkString(familyName), variationSet);
            }
        } else {
            (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::arrayValue,
                root[key].type());
        }
    }
    if (hasIndex) {
        key = "index";
        if (root[key].isArray()) {
            parseTtcIndex(root[key], familyName);
        } else {
            (void) logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::arrayValue, root[key].type());
        }
    }
    std::unique_ptr<FallbackInfo> fallback = std::make_unique<FallbackInfo>();
    fallback->familyName = familyName;
    fallback->langs = lang;
    fallback->typefaceSet = std::make_shared<TypefaceSet>();
    fallbackNames.set(SkString(familyName), fallbackSet.size());
    fallbackSet.emplace_back(std::move(fallback));
    return NO_ERROR;
}

/*! To parse an item of 'variations' attribute
 * \param root the root node of an item in 'variations' list
 * \param[out] variationSet the value of VariationInfo is written to and returned to the caller
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 * \return ERROR_CONFIG_MISSING_TAG missing tag of 'weight' or 'wght'
 */
int FontConfig_OHOS::parseVariation(const Json::Value& root, std::vector<VariationInfo>& variationSet)
{
    const char* key = nullptr;
    const char* tags[] = {"wght", "wdth", "slnt", "weight", "width", "slant"};
    VariationInfo info;
    for (unsigned int i = 0; i < sizeof(tags) / sizeof(char*); i++) {
        key = tags[i];
        if ((!strcmp(key, "wght") || !strcmp(key, "weight")) &&
            !root.isMember(key)) {
            return logErrInfo(ERROR_CONFIG_MISSING_TAG, key);
        }
        if (!root.isMember(key)) {
            continue;
        }
        if (!strcmp(key, "weight")) {
            if (!root[key].isInt()) {
                return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::intValue, root[key].type());
            }
            info.weight = root[key].asInt();
        } else if (!strcmp(key, "width")) {
            if (!root[key].isInt()) {
                return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::intValue, root[key].type());
            }
            info.width = root[key].asInt();
        } else if (!strcmp(key, "slant")) {
            if (!root[key].isString()) {
                return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::stringValue, root[key].type());
            }
            const char* str = root[key].asCString();
            if (!strcmp(str, "normal")) {
                info.slant = static_cast<int>(SkFontStyle::kUpright_Slant);
            } else if (!strcmp(str, "italic")) {
                info.slant = static_cast<int>(SkFontStyle::kItalic_Slant);
            } else if (!strcmp(str, "oblique")) {
                info.slant = static_cast<int>(SkFontStyle::kOblique_Slant);
            }
        } else {
            if (!root[key].isNumeric()) {
                return logErrInfo(ERROR_CONFIG_INVALID_VALUE_TYPE, key, Json::realValue, root[key].type());
            }
            Coordinate axis;
            axis.axis = SkSetFourByteTag(key[0], key[1], key[2], key[3]);
            axis.value = root[key].asFloat();
            info.axis.emplace_back(axis);
        }
    }
    variationSet.emplace_back(info);
    return NO_ERROR;
}

/*! To parse  'index' attribute
 * \param root the root node of 'index' attribute
 * \param familyName the name of the family which the root node belongs to
 * \return NO_ERROR successful
 * \return ERROR_CONFIG_INVALID_VALUE_TYPE invalid value type for an attribute
 */
int FontConfig_OHOS::parseTtcIndex(const Json::Value& root, const SkString& familyName)
{
    unsigned int keyCount = 2; // the value of 'index' is an array with 2 items.
    if (root.size() == keyCount && root[0].isString() && root[1].isNumeric()) {
        TtcIndexInfo item = { SkString(root[0].asCString()), root[1].asInt() };
        if (item.ttcIndex != 0 && ttcIndexMap.find(item.familyName) == nullptr) {
            ttcIndexMap.set(SkString(item.familyName), {SkString(item.familyName), 0});
        }
        ttcIndexMap.set(SkString(familyName), item);
    } else {
        int ret = ERROR_CONFIG_INVALID_VALUE_TYPE;
        SkString text;
        const char* key = "index";
        if (root.size() != keyCount) {
            text.appendf("%s#0", key);
            errSet.emplace_back(ret, text.c_str());
//             LOGE("%s : '%s' size should be 2, but here it's %d\n", errToString(ret), key, root.size());
            return ret;
        } else if (!root[0].isString()) {
            text.appendf("%s#1", key);
            return logErrInfo(ret, text.c_str(), Json::stringValue, root[0].type());
        } else {
            text.appendf("%s#2", key);
            return logErrInfo(ret, text.c_str(), Json::intValue, root[1].type());
        }
    }
    return NO_ERROR;
}

/*! To get the axis value and set to 'font'
 * \param axisDefs the axis ranges of a font
 * \param variation the variation data from which axis values are generated
 * \param[out] font the axis values will be written to and returned to the caller
 */
void FontConfig_OHOS::getAxisValues(const AxisDefinitions& axisDefs,
    const VariationInfo& variation, FontInfo& font) const
{
    SkFontArguments::VariationPosition position;
    position.coordinateCount = variation.axis.size();
    position.coordinates = variation.axis.data();

    int count = axisDefs.size();
    SkFixed axisValues[count];
    SkFontScanner_FreeType::computeAxisValues(axisDefs, position,
        axisValues, font.familyName);
    font.axisSet.axis.clear();
    font.axisSet.range.clear();
    for (int i = 0; i < count; i++) {
        font.axisSet.axis.emplace_back(axisValues[i]);
        font.axisSet.range.emplace_back(axisDefs[i]);
    }
}

/*! To insert a ttc font into a font style set
 * \param count the count of typeface in a ttc font
 * \param font an object of the FontInfo with font information
 * \return true, if the font is a ttc font and added to corresponding font style set
 * \return false, if the font is not a ttc font
 */
bool FontConfig_OHOS::insertTtcFont(int count, FontInfo& font)
{
    bool ret = false;
    ttcIndexMap.foreach([this, count, &font, &ret]
        (const SkString& familyName, TtcIndexInfo* info) {
        if (info->familyName == font.familyName && info->ttcIndex < count) {
            SkString specifiedName;
            TypefaceSet* tpSet = this->getTypefaceSet(familyName, specifiedName);
            if (tpSet) {
                FontInfo newFont(font);
                newFont.familyName = familyName;
                newFont.index = info->ttcIndex;
                sk_sp<SkTypeface_OHOS> typeface = sk_make_sp<SkTypeface_OHOS>(specifiedName, newFont);
                tpSet->push_back(std::move(typeface));
                ret = true;
            }
        }
    });
    return ret;
}

/*! To insert a variable font into a font style set
 * \param axisDefs the axis ranges of a variable font
 * \param font an object of the FontInfo with font information
 * \return true, if the font is a variable and some typefaces are added to the corresponding font style set
 * \return false, if the font is not variable
 */
bool FontConfig_OHOS::insertVariableFont(const AxisDefinitions& axisDefs, FontInfo& font)
{
    const SkString& key = font.familyName;
    if (variationMap.find(key) == nullptr || axisDefs.size() == 0) {
        return false;
    }
    SkString specifiedName;
    TypefaceSet* tpSet = getTypefaceSet(key, specifiedName);
    if (tpSet == nullptr) {
        return false;
    }
    const std::vector<VariationInfo>& variationSet = *(variationMap.find(key));
    for (unsigned int i = 0; i < variationSet.size(); i++) {
        FontInfo newFont(font);
        getAxisValues(axisDefs, variationSet[i], newFont);
        int width = font.style.width();
        SkFontStyle::Slant slant = font.style.slant();
        if (variationSet[i].width != -1) {
            width = variationSet[i].width;
        }
        if (variationSet[i].slant != -1) {
            slant = (SkFontStyle::Slant) variationSet[i].slant;
        }
        newFont.style = SkFontStyle(variationSet[i].weight, width, slant);
        sk_sp<SkTypeface_OHOS> typeface = sk_make_sp<SkTypeface_OHOS>(specifiedName, newFont);
        tpSet->push_back(std::move(typeface));
    }
    return true;
}

/*! To get the typeface set of a font style set
 * \param familyName the family name of a font style set
 * \param[out] specifiedName the specified family name of a font style set returned to the caller
 * \return The object of typeface set
 * \n      Return null, if the family name is not found in the system
 */
TypefaceSet* FontConfig_OHOS::getTypefaceSet(const SkString& familyName,
    SkString& specifiedName) const
{
    std::lock_guard<std::mutex> lock(fontMutex);
    if (aliasMap.find(familyName) != nullptr) {
        const std::vector<AliasInfo>& aliasSet = *(aliasMap.find(familyName));
        if (aliasSet.size()) {
            int index = aliasSet[0].pos;
            specifiedName = genericFamilySet[index]->familyName;
            return genericFamilySet[index]->typefaceSet.get();
        }
    } else if (fallbackNames.find(familyName) != nullptr) {
        int index = *(fallbackNames.find(familyName));
        return fallbackSet[index]->typefaceSet.get();
    }
    return nullptr;
}

/*! To load font information from a font file
 * \param scanner a scanner used to parse the font file
 * \param fname the full name of a font file
 * \return NO_ERROR successful
 * \return ERROR_FONT_NOT_EXIST font file is not exist
 * \return ERROR_FONT_INVALID_STREAM the stream is not recognized
 */
int FontConfig_OHOS::loadFont(const SkFontScanner& scanner, const char* fname)
{
    std::unique_ptr<SkStreamAsset> stream = SkStream::MakeFromFile(fname);
    int count = 1;
    SkFontScanner::AxisDefinitions axisDefs;
    FontInfo font(fname, 0);
    if (stream == nullptr ||
        scanner.recognizedFont(stream.get(), &count) == false ||
        scanner.scanFont(stream.get(), 0, &font.familyName, &font.style,
            &font.isFixedWidth, &axisDefs) == false) {
        int err = NO_ERROR;
        if (stream == nullptr) {
            err = ERROR_FONT_NOT_EXIST;
        } else {
            err = ERROR_FONT_INVALID_STREAM;
        }
//         LOGE("%s : %s\n", errToString(err), fname);
        char* fnameCopy = strdup(fname);
        errSet.emplace_back(err, basename(fnameCopy));
        free(fnameCopy);
        return err;
    }
    // for adjustMap - update weight
    if (adjustMap.find(font.familyName) != nullptr) {
        const std::vector<AdjustInfo> adjustSet = *(adjustMap.find(font.familyName));
        for (unsigned int i = 0; i < adjustSet.size(); i++) {
            if (font.style.weight() == adjustSet[i].origValue) {
                font.style = SkFontStyle(adjustSet[i].newValue, font.style.width(), font.style.slant());
                break;
            }
        }
    }
    bool ret = false;
    if (count > 1) {
    ret = insertTtcFont(count, font);
    } else if (axisDefs.size() > 0) {        ret = insertVariableFont(axisDefs, font);

    }
    int iaxisDefs = axisDefs.size();
    OH_LOG_ERROR(LOG_APP, "cyjskia_________cyj_______axisDefs.size() %{private}d",iaxisDefs);
    
    if (!ret) {
        SkString specifiedName;
        TypefaceSet* tpSet = getTypefaceSet(font.familyName, specifiedName);
        if (tpSet) {
            sk_sp<SkTypeface_OHOS> typeface = sk_make_sp<SkTypeface_OHOS>(specifiedName, font);
            tpSet->push_back(std::move(typeface));
        }
    }
    return NO_ERROR;
}

/*! To scan the system font directories
 * \param fontScanner the scanner used to parse a font file
 * \return NO_ERROR success
 * \return ERROR_DIR_NOT_FOUND a font directory is not exist
 */
int FontConfig_OHOS::scanFonts(const SkFontScanner& fontScanner)
{
    int err = NO_ERROR;
    if (fontDirSet.size() == 0) {
        fontDirSet.emplace_back(SkString("/system/fonts/"));
    }
    for (unsigned int i = 0; i < fontDirSet.size(); i++) {
        DIR* dir = opendir(fontDirSet[i].c_str());
        if (dir == nullptr) {
            err = logErrInfo(ERROR_DIR_NOT_FOUND, fontDirSet[i].c_str());
            continue;
        }
        struct dirent* node = nullptr;

        while ((node = readdir(dir))) {
            if (node->d_type != DT_REG) {
                continue;
            }
            const char* fname = node->d_name;

            if (G_IS_HMSYMBOL_ENABLE && (strcmp(fname, "hm_symbol_config_next.json") == 0)) {
                HmSymbolConfig_OHOS::GetInstance()->ParseConfigOfHmSymbol(fname, fontDirSet[i]);
                continue;
            }

            int len = strlen(fname);
            int suffixLen = strlen(".ttf");
            if (len < suffixLen || (strncmp(fname + len - suffixLen, ".ttf", suffixLen) &&
                strncmp(fname + len - suffixLen, ".otf", suffixLen) &&
                strncmp(fname + len - suffixLen, ".ttc", suffixLen) &&
                strncmp(fname + len - suffixLen, ".otc", suffixLen))) {
                continue;
            }
            len += (fontDirSet[i].size() + 2); // 2 more characters for '/' and '\0'
            char fullname[len];
//             memset_s(fullname, len,  0, len);
//             strcpy_s(fullname, len, fontDirSet[i].c_str());
            memset(fullname, 0, len);
            strcpy(fullname,fontDirSet[i].c_str());
            if (fontDirSet[i][fontDirSet[i].size() - 1] != '/') {
//                 strcat_s(fullname, len, "/");
                strcat(fullname, "/");
            }

//             strcat_s(fullname, len, fname);
            strcat(fullname, fname);
            loadFont(fontScanner, fullname);
        }
        closedir(dir);
    }
    fontDirSet.clear();
    return err;
}

/*! To reset the generic family
 * \n 1. To sort the typefaces for each font style set in generic list
 * \n 2. To build typeface set for those font style sets which have single weight value
 */
void FontConfig_OHOS::resetGenericValue()
{
    aliasMap.foreach([this](const SkString& key, std::vector<AliasInfo>* pAliasSet) {
        std::vector<AliasInfo>& aliasSet = *pAliasSet;
        int index = aliasSet[0].pos;
        if (genericFamilySet[index]->typefaceSet->size() == 0) {
            this->logErrInfo(ERROR_FAMILY_NOT_FOUND, key.c_str());
        } else {
            sortTypefaceSet(genericFamilySet[index]->typefaceSet);
            for (unsigned int i = 1; i < aliasSet.size(); i++) {
                if (aliasSet[i].weight == 0) {
                    continue;
                }
                buildSubTypefaceSet(genericFamilySet[index]->typefaceSet,
                    genericFamilySet[index + i]->typefaceSet,
                    genericFamilySet[index + i]->familyName,
                    aliasSet[i].weight);
                if (genericFamilySet[index + i]->typefaceSet->size() == 0) {
                    this->logErrInfo(ERROR_FAMILY_NOT_FOUND,
                        genericFamilySet[index + i]->familyName.c_str());
                }
            }
        }
    });

    aliasMap.reset();
    adjustMap.reset();
    variationMap.reset();
    ttcIndexMap.reset();
}

/*! To build a sub typeface set according to weight from a typeface set
 * \param typefaceSet the parent typeface set
 * \param[out] subSet the sub typeface set returned to the caller
 * \param familyName the family name of the sub typeface set
 * \param weight the weight of the sub typeface set
 */
void FontConfig_OHOS::buildSubTypefaceSet(const std::shared_ptr<TypefaceSet>& typefaceSet,
    std::shared_ptr<TypefaceSet>& subSet, const SkString& familyName, int weight)
{
    if (typefaceSet->size() == 0) {
        return;
    }
    for (unsigned int i = 0; i < typefaceSet->size(); i++) {
        const SkTypeface_OHOS* typeface = (*typefaceSet)[i].get();
        if (typeface && typeface->fontStyle().weight() == weight) {
            const FontInfo* pFont = typeface->getFontInfo();
            if (pFont == nullptr) {
                continue;
            }
            FontInfo font(*pFont);
            sk_sp<SkTypeface_OHOS> newTypeface = sk_make_sp<SkTypeface_OHOS>(familyName, font);
            subSet->push_back(std::move(newTypeface));
        }
    }
}

/*! To reset the fallback value
 * \n To sort the typefaces for each font style set in fallback list.
 */
void FontConfig_OHOS::resetFallbackValue()
{
    for (unsigned int i = 0; i < fallbackSet.size(); i++) {
        if (fallbackSet[i]->typefaceSet->size() == 0) {
            logErrInfo(ERROR_FAMILY_NOT_FOUND, fallbackSet[i]->familyName.c_str());
        }
        sortTypefaceSet(fallbackSet[i]->typefaceSet);
    }
}

/*! To check if an error happened
 * \param err the id of an error
 * \param text the key to indicate the part with the error happened
 * \return false, this kind of error did not happen
 * \return true, the error happened
 */
bool FontConfig_OHOS::hasError(int err, const SkString& text) const
{
    for (unsigned int i = 0; i < errSet.size(); i++) {
        if (errSet[i].err == err && errSet[i].text == text) {
            return true;
        }
    }
    return false;
}

/*! To get the total count of errors happened
 * \return The count of errors
 */
int FontConfig_OHOS::getErrorCount() const
{
    return errSet.size();
}

/*! To sort the typeface set
 * \param typefaceSet the typeface set to be sorted
 */
void FontConfig_OHOS::sortTypefaceSet(std::shared_ptr<TypefaceSet>& typefaceSet)
{
    if (typefaceSet.get() == nullptr || typefaceSet->size() <= 1) {
        return;
    }
    TypefaceSet& tpSet = *(typefaceSet.get());
    for (unsigned int i = 0; i < tpSet.size(); i++)
    for (unsigned int j = 0; j < tpSet.size() - 1; j++) {
        if ((tpSet[j]->fontStyle().weight() > tpSet[j + 1]->fontStyle().weight()) ||
            (tpSet[j]->fontStyle().weight() == tpSet[j + 1]->fontStyle().weight() &&
            tpSet[j]->fontStyle().slant() > tpSet[j + 1]->fontStyle().slant())) {
            tpSet[j].swap(tpSet[j + 1]);
        }
    }
}

/*! To get the display text of an error
 * \param err the id of an error
 * \return The text to explain the error
 */
const char* FontConfig_OHOS::errToString(int err)
{
    const static std::array<const char*, ERROR_TYPE_COUNT> errToString{
        "successful",                                                      // NO_ERROR = 0
        "config file is not found",                              // ERROR_CONFIG_NOT_FOUND
        "the format of config file is not supported", // ERROR_CONFIG_FORMAT_NOT_SUPPORTED
        "missing tag",                                         // ERROR_CONFIG_MISSING_TAG
        "invalid value type",                           // ERROR_CONFIG_INVALID_VALUE_TYPE
        "font file is not exist",                                  // ERROR_FONT_NOT_EXIST
        "invalid font stream",                                // ERROR_FONT_INVALID_STREAM
        "no font stream",                                          // ERROR_FONT_NO_STREAM
        "family is not found",                                   // ERROR_FAMILY_NOT_FOUND
        "no available family in the system",                   //ERROR_NO_AVAILABLE_FAMILY
        "no such directory"                                         // ERROR_DIR_NOT_FOUND
    };
    if (err >= 0 && err < ERROR_TYPE_COUNT) {
        return errToString[err];
    }
    return "unknown error";
}

/*! To log the error information
 * \param err the id of an error
 * \param key the key which indicates the the part with the error
 * \param expected the expected type of json node.
 * \n     It's used only for err 'ERROR_CONFIG_INVALID_VALUE_TYPE'
 * \param actual the actual type of json node.
 * \n     It's used only for err 'ERROR_CONFIG_INVALID_VALUE_TYPE'
 * \return err
 */
int FontConfig_OHOS::logErrInfo(int err, const char* key, Json::ValueType expected,
    Json::ValueType actual)
{
    errSet.emplace_back(err, key);
    if (err != ERROR_CONFIG_INVALID_VALUE_TYPE) {
//         LOGE("%s : %s\n", errToString(err), key);
    } else {
        const char* types[] = {
            "null",
            "int",
            "unit",
            "real",
            "string",
            "boolean",
            "array",
            "object",
        };
        int size = sizeof(types) / sizeof(char*);
        if ((expected >= 0 && expected < size) &&
            (actual >= 0 && actual < size)) {
//             LOGE("%s : '%s' should be '%s', but here it's '%s'\n",
//                 errToString(err), key, types[expected], types[actual]);
  } else {
//            LOGE("%s : %s\n", errToString(err), key);
        }
    }
    return err;
}

bool FontConfig_OHOS::judgeFileExist()
{
    bool haveFile = false;
    for (unsigned int i = 0; i < fontDirSet.size(); i++) {
        DIR* dir = opendir(fontDirSet[i].c_str());
        if (dir == nullptr) {
            logErrInfo(ERROR_DIR_NOT_FOUND, fontDirSet[i].c_str());
            continue;
        }
        struct dirent* node = nullptr;
#if defined(SK_BUILD_FONT_MGR_FOR_PREVIEW_WIN)
        struct stat fileStat;
#endif
        while ((node = readdir(dir))) {
#if defined(SK_BUILD_FONT_MGR_FOR_PREVIEW_WIN)
            stat(node->d_name, &fileStat);
            if (S_ISDIR(fileStat.st_mode)) {
                continue;
            }
#else
            if (node->d_type != DT_REG) {
                continue;
            }
#endif
            const char* fileName = node->d_name;
            int len = strlen(fileName);
            int suffixLen = strlen(".ttf");
            if (len < suffixLen || (strncmp(fileName + len - suffixLen, ".ttf", suffixLen) &&
                strncmp(fileName + len - suffixLen, ".otf", suffixLen) &&
                strncmp(fileName + len - suffixLen, ".ttc", suffixLen) &&
                strncmp(fileName + len - suffixLen, ".otc", suffixLen))) {
                continue;
            }
            haveFile = true;
            break;
        }
        (void)closedir(dir);
        if (haveFile) {
            break;
        }
    }
    return haveFile;
}

// int FontConfig_OHOS::checkProductFile(const char* fname)
// {
//     std::lock_guard<std::mutex> lock(fontMutex);
//     int err = parseConfig(PRODUCT_DEFAULT_CONFIG);
//     SkDebugf("parse productfontconfig json file err = %d", err);
//     if ((err != NO_ERROR) || (!judgeFileExist())) {
//         SkDebugf("parse productfontconfig json file error");
//         fontDirSet.clear();
//         fallbackForMap.reset();
//         genericFamilySet.clear();
//         fallbackSet.clear();
//         genericNames.reset();
//         fallbackNames.reset();
//         errSet.clear();
//         aliasMap.reset();
//         adjustMap.reset();
//         variationMap.reset();
//         ttcIndexMap.reset();
//         err = parseConfig(fname);
//     }
//     return err;
// }