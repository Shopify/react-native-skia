/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "SkFontMgr_ohos.h"

#include "SkTypeface_ohos.h"

using namespace ErrorCode;

/*! Constructor
 * \param path the full path of system font configuration document
 */
SkFontMgr_OHOS::SkFontMgr_OHOS(const char* path)
{
    
    fontConfig = std::make_shared<FontConfig_OHOS>(fontScanner, path);
    familyCount = fontConfig->getFamilyCount();
}

/*! To get the count of families
 * \return The count of families in the system
 */
int SkFontMgr_OHOS::onCountFamilies() const
{
    return familyCount;
}

/*! To get the family name for a font style set
 * \param index the index of a font style set
 * \param[out] familyName the family name returned to the caller
 * \n          The family name will be reset to "", if index is out of range
 */
void SkFontMgr_OHOS::onGetFamilyName(int index, SkString* familyName) const
{
    if (fontConfig == nullptr || familyName == nullptr) {
        return;
    }
    fontConfig->getFamilyName(index, familyName);
}

/*! To create an object of SkFontStyleSet
 * \param index the index of a font style set
 * \return The pointer of SkFontStyleSet
 * \n      Return null, if index is out of range
 * \note   The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkFontStyleSet> SkFontMgr_OHOS::onCreateStyleSet(int index) const
{
    if (fontConfig == nullptr) {
        return nullptr;
    }
    if (index < 0 || index >= this->countFamilies()) {
        return nullptr;
    }
    return sk_make_sp<SkFontStyleSet_OHOS>(fontConfig, index);
}

/*! To get a matched object of SkFontStyleSet
 * \param familyName the family name of a font style set
 * \return The pointer of SkFontStyleSet
 * \n      Return the default font style set, if family name is null
 * \n      Return null, if family name is not found
 * \note   The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkFontStyleSet> SkFontMgr_OHOS::onMatchFamily(const char familyName[]) const
{
    if (fontConfig == nullptr) {
        return nullptr;
    }
    // return default system font when familyName is null
    if (familyName == nullptr) {
        return  sk_make_sp<SkFontStyleSet_OHOS>(fontConfig, 0);
    }

    bool isFallback = false;
    int index = fontConfig->getStyleIndex(familyName, isFallback);
    if (index == -1) {
        return nullptr;
    }
    return sk_make_sp<SkFontStyleSet_OHOS>(fontConfig, index, isFallback);
}

/*! To get a matched typeface
 * \param familyName the family name of a font style set
 * \param style the font style to be matched
 * \return An object of typeface which is closest matching to 'style'
 * \n      Return the typeface in the default font style set, if family name is null
 * \n      Return null, if family name is not found
 * \note   The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onMatchFamilyStyle(const char familyName[], const SkFontStyle& style) const
{
    if (fontConfig == nullptr) {
        return nullptr;
    }
    bool isFallback = false;
    int styleIndex = 0;
    if (familyName) {
        styleIndex = fontConfig->getStyleIndex(familyName, isFallback);
    }
    return sk_ref_sp(fontConfig->getTypeface(styleIndex, style, isFallback));
}

/*! To get a matched typeface
 * \n Use the system fallback to find a typeface for the given character.
 * \param familyName the family name which the typeface is fallback For
 * \param style the font style to be matched
 * \param bcp47 an array of languages which indicate the language of 'character'
 * \param bcp47Count the array size of bcp47
 * \param character a UTF8 value to be matched
 * \return An object of typeface which is for the given character
 * \return Return the typeface in the default fallback set, if familyName is null
 * \return Return null, if the typeface is not found for the given character
 * \note The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onMatchFamilyStyleCharacter(const char familyName[], const SkFontStyle& style,
    const char* bcp47[], int bcp47Count, SkUnichar character) const
{
    if (fontConfig == nullptr) {
        return nullptr;
    }
    const FallbackForMap& fallbackForMap = fontConfig->getFallbackForMap();
    const FallbackSet& fallbackSet = fontConfig->getFallbackSet();
    SkString defaultFamily("");
    SkString key = defaultFamily;
    FallbackSetPos* item = nullptr;
    if (familyName == nullptr) {
        item = fallbackForMap.find(defaultFamily);
    } else {
        item = fallbackForMap.find(SkString(familyName));
        if (item) {
            key = SkString(familyName);
        } else {
            item = fallbackForMap.find(defaultFamily);
        }
    }
    if (item == nullptr) {
//         LOGE("%s : '%s' must be a fallback key in the config file\n",
//             FontConfig_OHOS::errToString(ERROR_FAMILY_NOT_FOUND), defaultFamily.c_str());
        return nullptr;
    }
    while (true) {
        if (bcp47Count > 0) {
            sk_sp<SkTypeface> retTp = findTypeface(*item, style, bcp47, bcp47Count, character);
            if (retTp) {
                return retTp;
            }
            if (key == defaultFamily) {
                bcp47Count = 0;
                continue;
            }
            item = fallbackForMap.find(defaultFamily);
            key = defaultFamily;
        } else {
            for (unsigned int i = item->index; i < item->index + item->count && i < fallbackSet.size(); i++) {
                const TypefaceSet& tpSet = *(fallbackSet[i]->typefaceSet.get());
                if (tpSet.size() > 0 && tpSet[0]->unicharToGlyph(character) != 0) {
                    sk_sp<SkTypeface> typeface = FontConfig_OHOS::matchFontStyle(tpSet, style);
                    return sk_ref_sp(typeface.get());
                }
            }
            if (key == defaultFamily) {
                break;
            }
            item = fallbackForMap.find(defaultFamily);
            key = defaultFamily;
        }
    }
    return nullptr;
}

/*! To find the matched typeface for the given parameters
 * \n Use the system fallback to find a typeface for the given character.
 * \param fallbackItem the fallback items in which to find the typeface
 * \param style the font style to be matched
 * \param bcp47 an array of languages which indicate the language of 'character'
 * \param bcp47Count the array size of bcp47
 * \param character a UTF8 value to be matched
 * \return An object of typeface which is for the given character
 * \return Return null, if the typeface is not found for the given character
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::findTypeface(const FallbackSetPos& fallbackItem, const SkFontStyle& style,
    const char* bcp47[], int bcp47Count, SkUnichar character) const
{
    if (bcp47Count == 0) {
        return nullptr;
    }

    const FallbackSet& fallbackSet = fontConfig->getFallbackSet();
    // example bcp47 code : 'zh-Hans' : ('zh' : iso639 code, 'Hans' : iso15924 code)
    // iso639 code will be taken from bcp47 code, so that we can try to match
    // bcp47 or only iso639. Therefore totalCount need to be 'bcp47Count * 2'
    int totalCount = bcp47Count * 2;
    int tps[totalCount];
    for (int i = 0; i < totalCount; i++) {
        tps[i] = -1;
    }
    // find the families matching the bcp47 list
    for (unsigned int i = fallbackItem.index; i < fallbackItem.index + fallbackItem.count
        && i < fallbackSet.size(); i++) {
        int ret = compareLangs(fallbackSet[i]->langs, bcp47, bcp47Count, tps);
        if (ret == -1) {
            continue;
        }
        tps[ret] = i;
    }
    // match typeface in families
    for (int i = bcp47Count - 1; i >= 0; i--) {
        if (tps[i] == -1) {
            continue;
        }
        const TypefaceSet& tpSet = *(fallbackSet[tps[i]]->typefaceSet.get());
        if (tpSet.size() > 0 && tpSet[0]->unicharToGlyph(character) != 0) {
            sk_sp<SkTypeface> typeface = FontConfig_OHOS::matchFontStyle(tpSet, style);
            return sk_ref_sp(typeface.get());
        }
    }
    for (int i = totalCount - 1; i >= bcp47Count; i--) {
        if (tps[i] == -1) {
            continue;
        }
        const TypefaceSet& tpSet = *(fallbackSet[tps[i]]->typefaceSet.get());
        if (tpSet.size() > 0 && tpSet[0]->unicharToGlyph(character) != 0) {
            sk_sp<SkTypeface> typeface = FontConfig_OHOS::matchFontStyle(tpSet, style);
            return sk_ref_sp(typeface.get());
        }
    }
    return nullptr;
}

/*! To compare the languages of an typeface with a bcp47 list
 * \param langs the supported languages by an typeface
 * \param bcp47 the array of bcp47 language to be matching
 * \param bcp47Count the array size of bcp47
 * \param tps an array of the index of typeface which is matching one value of bcp47
 * \return The index of language in bcp47, if matching happens
 * \n      Return -1, if no language matching happens
 */
int SkFontMgr_OHOS::compareLangs(const SkString& langs, const char* bcp47[],
    int bcp47Count, const int tps[]) const
{
    /*
     * zh-Hans : ('zh' : iso639 code, 'Hans' : iso15924 code)
     */
    if (bcp47 == nullptr || bcp47Count == 0) {
        return -1;
    }
    for (int i = bcp47Count - 1; i >= 0; i--) {
        if (tps[i] != -1) {
            continue;
        }
        if (langs.find(bcp47[i]) != -1) {
            return i;
        } else {
            const char* iso15924 = strrchr(bcp47[i], '-');
            if (iso15924 == nullptr) {
                continue;
            }
            iso15924++;
            int len = iso15924 - 1 - bcp47[i];
            SkString country(bcp47[i], len);
            if (langs.find(iso15924) != -1 ||
                (strncmp(bcp47[i], "und", strlen("und")) && langs.find(country.c_str()) != -1)) {
                return i + bcp47Count;
            }
        }
    }
    return -1;
}

/*! To get a matched typeface
 * \param typeface the given typeface with which the returned object should be in the same style set
 * \param style the font style to be matching
 * \return The object of typeface which is closest matching to the given 'style'
 * \n      Return null, if the family name of the given typeface is not found in the system
 * \note The caller must call unref() on the returned object if it's not null
 */
// SkTypeface* SkFontMgr_OHOS::onMatchFaceStyle(const SkTypeface* typeface, const SkFontStyle& style) const
// {
//     if (typeface == nullptr) {
//         return nullptr;
//     }
//     SkString familyName;
//     typeface->getFamilyName(&familyName);
//     return this->onMatchFamilyStyle(familyName.c_str(), style);
// }

/*! To create a typeface from the specified data and TTC index
 * \param data the data to be parsed
 * \param index the index of typeface. 0 for none
 * \return The object of typeface, if successful
 * \n      Return null if the data is not recognized.
 * \note The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onMakeFromData(sk_sp<SkData> data, int ttcIndex) const
{
    if (data == nullptr) {
        return nullptr;
    }
    std::unique_ptr<SkMemoryStream> memoryStream = std::make_unique<SkMemoryStream>(data);
    SkFontArguments args;
    args.setCollectionIndex(ttcIndex);
    return this->makeTypeface(std::move(memoryStream), args, nullptr);
}

/*! To create a typeface from the specified stream and TTC index
 * \param data the stream to be parsed
 * \param index the index of typeface. 0 for none
 * \return The object of typeface, if successful
 * \n      Return null if the stream is not recognized.
 * \note The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onMakeFromStreamIndex(std::unique_ptr<SkStreamAsset> stream,
    int ttcIndex) const
{
    if (stream == nullptr) {
        return nullptr;
    }
    SkFontArguments args;
    args.setCollectionIndex(ttcIndex);
    return this->makeTypeface(std::move(stream), args, nullptr);
}

/*! To create a typeface from the specified stream and font arguments
 * \param data the stream to be parsed
 * \param args the arguments of font
 * \return The object of typeface, if successful
 * \n      Return null if the stream is not recognized.
 * \note The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onMakeFromStreamArgs(std::unique_ptr<SkStreamAsset> stream,
    const SkFontArguments& args) const
{
    if (stream == nullptr) {
        return nullptr;
    }

    return this->makeTypeface(std::move(stream), args, nullptr);
}

/*! To create a typeface from the specified font file and TTC index
 * \param path the full path of the given font file
 * \param ttcIndex the index of typeface in a ttc font file. 0 means none.
 * \return The object of typeface, if successful
 * \n      Return null if the font file is not found or the content of file is not recognized.
 * \note The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onMakeFromFile(const char path[], int ttcIndex) const
{
    if (fontConfig == nullptr) {
        return nullptr;
    }

    std::unique_ptr<SkStreamAsset> stream = SkStreamAsset::MakeFromFile(path);
    if (stream == nullptr) {
//         LOGE("%s : %s\n", FontConfig_OHOS::errToString(ERROR_FONT_NOT_EXIST), path);
        return nullptr;
    }
    SkFontArguments args;
    args.setCollectionIndex(ttcIndex);
    return this->makeTypeface(std::move(stream), args, path);
}

/*! To get a typeface matching the specified family and style
 * \param familyName the specified name to be matching
 * \param style the specified style to be matching
 * \return The object of typeface which is the closest matching 'style' when the familyName is found
 * \return Return a typeface from the default family, if familyName is not found
 * \return Return null, if there is no any typeface in the system
 * \note The caller must caller unref() on the returned object is it's not null
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::onLegacyMakeTypeface(const char familyName[], SkFontStyle style) const
{
    sk_sp<SkTypeface> typeface = this->onMatchFamilyStyle(familyName, style);
    // if familyName is not found, then try the default family
    if (typeface == nullptr && familyName != nullptr) {
        typeface = this->onMatchFamilyStyle(nullptr, style);
    }

    if (typeface) {
        return sk_sp<SkTypeface>(typeface);
    }
//     LOGE("%s\n", FontConfig_OHOS::errToString(ERROR_NO_AVAILABLE_FAMILY));
    return nullptr;
}

/*! To make a typeface from the specified stream and font arguments
 * \param stream the specified stream to be parsed to get font information
 * \param args the arguments of index or axis values
 * \param path the fullname of font file
 * \return The object of typeface if successful
 * \n      Return null, if the stream is not recognized
 */
sk_sp<SkTypeface> SkFontMgr_OHOS::makeTypeface(std::unique_ptr<SkStreamAsset> stream,
    const SkFontArguments& args, const char path[]) const
{
    FontInfo fontInfo;
    int ttcIndex = args.getCollectionIndex();
    int axisCount = args.getVariationDesignPosition().coordinateCount;

    if (path) {
        fontInfo.fname.set(path);
    }
    if (axisCount == 0) {
        if (!fontScanner.scanFont(stream.get(), ttcIndex, &fontInfo.familyName, &fontInfo.style,
            &fontInfo.isFixedWidth, nullptr)) {
//             LOGE("%s\n", FontConfig_OHOS::errToString(ERROR_FONT_INVALID_STREAM));
            return nullptr;
        }
    } else {
        AxisDefinitions axisDef;
        if (!fontScanner.scanFont(stream.get(), ttcIndex, &fontInfo.familyName, &fontInfo.style,
            &fontInfo.isFixedWidth, &axisDef)) {
//             LOGE("%s\n", FontConfig_OHOS::errToString(ERROR_FONT_INVALID_STREAM));
            return nullptr;
        }
        if (axisDef.size() > 0) {
            SkFixed axis[axisDef.size()];
            SkFontScanner_FreeType::computeAxisValues(axisDef, args.getVariationDesignPosition(),
                axis, fontInfo.familyName);
            fontInfo.setAxisSet(axisCount, axis, axisDef.data());
            fontInfo.style = fontInfo.computeFontStyle();
        }
    }

    fontInfo.stream = std::move(stream);
    fontInfo.index = ttcIndex;
    return sk_make_sp<SkTypeface_OHOS>(fontInfo);
}

/*! To create SkFontMgr object for Harmony platform
 * \param fname the full name of system font configuration documents
 * \return The object of SkFontMgr_OHOS
 */
sk_sp<SkFontMgr> SkFontMgr_New_OHOS(const char* fname)
{
    return sk_make_sp<SkFontMgr_OHOS>(fname);
}
