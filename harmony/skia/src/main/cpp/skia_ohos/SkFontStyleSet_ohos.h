/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef SKFONTSTYLESET_OHOS_H
#define SKFONTSTYLESET_OHOS_H

#include "include/core/SkFontMgr.h"

#include "FontConfig_ohos.h"
#include "SkTypeface_ohos.h"

/*!
 * \brief To implement SkFontStyleSet for ohos platform
 */
class SK_API SkFontStyleSet_OHOS : public SkFontStyleSet {
public:
    SkFontStyleSet_OHOS(const std::shared_ptr<FontConfig_OHOS>& fontConfig,
        int index, bool isFallback = false);
    virtual ~SkFontStyleSet_OHOS() override = default;
    virtual int count() override;
    virtual void getStyle(int index, SkFontStyle* style, SkString* styleName) override;
    virtual sk_sp<SkTypeface> createTypeface(int index) override;
    virtual sk_sp<SkTypeface> matchStyle(const SkFontStyle& pattern) override;
private:
    std::shared_ptr<FontConfig_OHOS> fontConfig_ = nullptr; // the object of FontConfig_OHOS
    int styleIndex = 0; // the index of the font style set
    bool isFallback = false; // the flag of font style set. False for fallback family, true for generic family.
    int tpCount = -1; // the typeface count in the font style set
};

#endif /* SKFONTSTYLESET_OHOS_H */
