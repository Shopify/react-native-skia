/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef FONTCONFIG_OHOS_H
#define FONTCONFIG_OHOS_H

#include <json/include/json.h>
#include <vector>
#include <mutex>
#include "ports/SkTypeface_FreeType.h"
#include "src/core/SkFontDescriptor.h"
#include "include/core/SkFontStyle.h"
#include "include/core/SkStream.h"
#include "include/core/SkString.h"
#include "include/core/SkTypes.h"
#include "src/core/SkTHash.h"

#include "FontInfo_ohos.h"
#include "SkTypeface_ohos.h"

#include "HmSymbolConfig_ohos.h"


struct FontInfo;
struct FallbackInfo;
struct GenericFamily;
struct FallbackSetPos;

using TypefaceSet = std::vector<sk_sp<SkTypeface_OHOS>>;
using GenericFamilySet = std::vector<std::unique_ptr<GenericFamily>>;
using FallbackSet = std::vector<std::unique_ptr<FallbackInfo>>;
using FallbackForMap = skia_private::THashMap<SkString, FallbackSetPos>;
using NamesMap = skia_private::THashMap<SkString, int>;
using Coordinate = SkFontArguments::VariationPosition::Coordinate;
using AxisDefinitions = SkFontScanner::AxisDefinitions;

/*!
 * Error code definition
 */
namespace ErrorCode {

enum {
    NO_ERROR = 0,                           // no error
    ERROR_CONFIG_NOT_FOUND,                 // the configuration document is not found
    ERROR_CONFIG_FORMAT_NOT_SUPPORTED,      // the formation of configuration is not supported
    ERROR_CONFIG_MISSING_TAG,               // missing tag in the configuration
    ERROR_CONFIG_INVALID_VALUE_TYPE,        // invalid value type in the configuration
    ERROR_FONT_NOT_EXIST,                   // the font file is not exist
    ERROR_FONT_INVALID_STREAM,              // the stream is not recognized
    ERROR_FONT_NO_STREAM,                   // no stream in the font data
    ERROR_FAMILY_NOT_FOUND,                 // the family name is not found in the system
    ERROR_NO_AVAILABLE_FAMILY,              // no available family in the system
    ERROR_DIR_NOT_FOUND,                    // the directory is not exist

    ERROR_TYPE_COUNT,
};

} /* namespace ErrorCode */

/*!
 *  \brief To manage the related information of a 'fallbackFor' family name
 */
struct FallbackSetPos {
    unsigned int index; // the index of the first font style set in the fallback set for a specified family name
    unsigned int count; // the count of font style sets for a specified family name
};

/*!
 * \brief To manage the information for a generic family item
 */
struct GenericFamily {
    SkString familyName; // the specified family name of the font style set
    std::shared_ptr<TypefaceSet> typefaceSet; // the typeface set of the font style set
    virtual ~GenericFamily() = default;
};

/*!
 * \brief To manage the information for a fallback family item
 */
struct FallbackInfo : GenericFamily {
    SkString langs; // the language for which the font style set is
};

/*!
 * \brief To parse the font configuration document and manage the system fonts
 */
class FontConfig_OHOS {
public:
    explicit FontConfig_OHOS(const SkFontScanner& fontScanner,
        const char* fname = nullptr);
    virtual ~FontConfig_OHOS() = default;
    const FallbackForMap& getFallbackForMap() const;
    const FallbackSet& getFallbackSet() const;
    int getFamilyCount() const;
    int getDefaultFamily(SkString* familyName) const;
    int getFamilyName(int index, SkString* familyName) const;
    int getTypefaceCount(int styleIndex, bool isFallback = false) const;
    int getStyleIndex(const char* familyName, bool& isFallback) const;

    SkTypeface_OHOS* getTypeface(int styleIndex, int index, bool isFallback = false) const;
    SkTypeface_OHOS* getTypeface(int styleIndex, const SkFontStyle& style,
        bool isFallback = false) const;

#if ENABLE_DEBUG
    void dumpFont(const FontInfo& font) const;
    void dumpGeneric() const;
    void dumpFallback() const;
#endif
    bool hasError(int err, const SkString& text) const;
    int getErrorCount() const;

    static sk_sp<SkTypeface_OHOS> matchFontStyle(const TypefaceSet& typefaceSet, const SkFontStyle& pattern);

    static const char* errToString(int err);
private:
    const uint32_t defaultColorHexLen = 9;
    const uint32_t defaultColorStrLen = 7;
    const uint32_t hexFlag = 16;
    const uint32_t twoBytesBitsLen = 16;
    const uint32_t oneByteBitsLen = 8;

    struct AliasInfo;
    struct AdjustInfo;
    struct VariationInfo;
    struct TtcIndexInfo;
    using AliasMap = skia_private::THashMap<SkString, std::vector<AliasInfo>>;
    using AjdustMap = skia_private::THashMap<SkString, std::vector<AdjustInfo>>;
    using VariationMap = skia_private::THashMap<SkString, std::vector<VariationInfo>>;
    using TtcIndexMap = skia_private::THashMap<SkString, TtcIndexInfo>;

    /*!
     * \brief To manage the adjust information
     */
    struct AdjustInfo {
        int origValue; // the real value of the font weight
        int newValue; // the specified value of weight for a font
    };

    /*!
     * \brief To manage the alias information of
     */
    struct AliasInfo {
        int pos; // the index of a font style set in generic family list.
        int weight; // the weight of the font style set. 0 means no specified weight
    };

    /*!
     * \brief To manage the variation information
     */
    struct VariationInfo {
        VariationInfo() : weight(-1), width(-1), slant(-1){}
        std::vector<Coordinate> axis; // the axis set such as 'wght', 'wdth' and 'slnt'.
        int weight; // the value of mapping weight
        int width;  // the value of mapping width
        int slant; // the value of mapping slant
    };

    /*!
     * \brief To manage the 'index' information for ttc fonts
     */
    struct TtcIndexInfo {
        SkString familyName; // the family name of the first typeface in a ttc font
        int ttcIndex; // the index of a typeface in a ttc font
    };

    /*!
     * \brief To manage the information of errors happened
     */
    struct ErrorInfo {
        ErrorInfo(int err, const char* text) : err(err), text(SkString(text)){}
        ErrorInfo(int err, SkString& text) : err(err), text(std::move(text)){}
        int err; // error id
        SkString text; // the part with error
    };

    std::vector<SkString> fontDirSet; // the directories where the fonts are

    FallbackForMap    fallbackForMap; // a hash table to save the fallbackFor pairs
    GenericFamilySet genericFamilySet; // the font style set list of generic family
    FallbackSet fallbackSet; // the font style set list of fallback family

    NamesMap genericNames; // a map to store the index of a family for generic family
    NamesMap fallbackNames; // a map to store the index of a family for fallback family

    std::vector<ErrorInfo> errSet; // the errors happened
    AliasMap aliasMap; // to save alias information temporarily
    AjdustMap adjustMap; // to save adjust information temporarily
    VariationMap variationMap; // to save variation information temporarily
    TtcIndexMap ttcIndexMap; // to save 'index' information temporarily

    mutable std::mutex fontMutex;

    int parseConfig(const char* fname);
    int checkConfigFile(const char* fname, Json::Value& root);
    int parseFontDir(const char* fname, const Json::Value& root);
    int parseGeneric(const Json::Value& root);
    int parseFallback(const Json::Value& root);
    int parseFallbackItem(const Json::Value& root);
    int parseAlias(const Json::Value& root, std::vector<AliasInfo>& aliasSet);
    int parseAdjust(const Json::Value& root, std::vector<AdjustInfo>& adjustSet);
    int parseVariation(const Json::Value& root, std::vector<VariationInfo>& variationSet);
    int parseTtcIndex(const Json::Value& root, const SkString& familyName);
    void getAxisValues(const AxisDefinitions& axisDefinitions,
        const VariationInfo& variation, FontInfo& font) const;
    bool insertTtcFont(int count, FontInfo& font);
    bool insertVariableFont(const AxisDefinitions& axisDefinitions, FontInfo& font);
    TypefaceSet* getTypefaceSet(const SkString& familyName, SkString& specifiedName) const;

    int loadFont(const SkFontScanner& scanner, const char* fname);
    int scanFonts(const SkFontScanner& fontScanner);
    void resetGenericValue();
    void buildSubTypefaceSet(const std::shared_ptr<TypefaceSet>& typefaceSet,
        std::shared_ptr<TypefaceSet>& subSet, const SkString& familyName, int weight);
    void resetFallbackValue();
    int logErrInfo(int err, const char* key, Json::ValueType expected = Json::nullValue,
        Json::ValueType actual = Json::nullValue);
    static void sortTypefaceSet(std::shared_ptr<TypefaceSet>& typefaceSet);
    static uint32_t getFontStyleDifference(const SkFontStyle& style1, const SkFontStyle& style2);
    static char* getFileData(const char* fname, int& size);
    FontConfig_OHOS(const FontConfig_OHOS&) = delete;
    FontConfig_OHOS& operator = (const FontConfig_OHOS&) = delete;
    FontConfig_OHOS(FontConfig_OHOS&&) = delete;
    FontConfig_OHOS& operator = (FontConfig_OHOS&&) = delete;
//     int checkProductFile(const char* fname);
    bool judgeFileExist();
};

#endif /* FONTCONFIG_OHOS_H */
