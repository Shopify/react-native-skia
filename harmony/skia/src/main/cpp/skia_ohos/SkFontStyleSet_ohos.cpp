/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "SkFontStyleSet_ohos.h"

/*! Constructor
 * \param fontConfig the pointer of FontConfig_OHOS
 * \param index the index of the font style set
 * \param isFallback true - the font style is from fallback family
 * \n                false - the font style is from generic family
 */
SkFontStyleSet_OHOS::SkFontStyleSet_OHOS(const std::shared_ptr<FontConfig_OHOS>& fontConfig,
    int index, bool isFallback)
    : fontConfig_(fontConfig), styleIndex(index), isFallback(isFallback)
{
    if (fontConfig) {
        tpCount = fontConfig_->getTypefaceCount(styleIndex, isFallback);
    }
}

/*! To get the count of typeface
 * \return The count of typeface in this font style set
 */
int SkFontStyleSet_OHOS::count()
{
    return tpCount;
}

/*! To get the font style for the specified typeface
 * \param the index of a typeface
 * \param[out] style the style value returned to the caller
 * \param[out] the style name returned to the caller
 */
void SkFontStyleSet_OHOS::getStyle(int index, SkFontStyle* style, SkString* styleName)
{
    if (index < 0 || index >= this->count() || fontConfig_ == nullptr) {
        return;
    }

    SkTypeface *typeface = fontConfig_->getTypeface(styleIndex, index, isFallback);
    if (typeface == nullptr) {
        return;
    }

    if (style) {
        *style = typeface->fontStyle();
    }
    if (styleName) {
        const char* names[] = {
            "invisible",
            "thin",
            "extralight",
            "light",
            "normal",
            "medium",
            "semibold",
            "bold",
            "extrabold",
            "black",
            "extrablack"
        };
        // the value of font weight is between 0 ~ 1000 (refer to SkFontStyle::Weight)
        // the weight is divided by 100 to get the matched name
        unsigned int i = typeface->fontStyle().weight() / 100;
        if (i < sizeof(names) / sizeof(char*)) {
            styleName->set(names[i]);
        } else {
            styleName->reset();
        }
    }
}

/*! To create a typeface
 * \param index the index of the typeface in this font style set
 * \return The object of a typeface, if successful
 * \n      Return null, if the 'index' is out of range
 * \note The caller must call unref() on the returned object if it's not null
 */
sk_sp<SkTypeface> SkFontStyleSet_OHOS::createTypeface(int index)
{
    if (index < 0 || index >= this->count()) {
        return nullptr;
    }
    if (fontConfig_) {
        return sk_ref_sp(fontConfig_->getTypeface(styleIndex, index, isFallback));
    }
    return nullptr;
}

/*! To get the closest matching typeface
 * \param pattern the style value to be matching
 * \return the object of a typeface which is the closest matching to 'pattern'
 * \note The caller must call unref() on the returned object
 */
sk_sp<SkTypeface> SkFontStyleSet_OHOS::matchStyle(const SkFontStyle& pattern)
{
    if (fontConfig_) {
        return sk_ref_sp(fontConfig_->getTypeface(styleIndex, pattern, isFallback));
    }
    return nullptr;
}