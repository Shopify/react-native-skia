/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef SKTYPEFACE_OHOS_H
#define SKTYPEFACE_OHOS_H


#include "core/SkFontMgr.h"
#include "include/core/SkFontStyle.h"
#include "include/core/SkStream.h"

#include "FontInfo_ohos.h"
#include "ports/SkTypeface_FreeType.h"

/*!
 * \brief The implementation of SkTypeface for ohos platform
 */
class SK_API SkTypeface_OHOS : public SkTypeface_FreeType {
public:
    SkTypeface_OHOS(const SkString& specifiedName, FontInfo& info);
    explicit SkTypeface_OHOS(FontInfo& info);
    virtual ~SkTypeface_OHOS() override = default;
    const FontInfo* getFontInfo() const;
protected:
    virtual std::unique_ptr<SkStreamAsset> onOpenStream(int* ttcIndex) const override;
    virtual std::unique_ptr<SkFontData> onMakeFontData() const override;
    virtual void onGetFontDescriptor(SkFontDescriptor* descriptor, bool* isLocal) const override;
    virtual void onGetFamilyName(SkString* familyName) const override;
    virtual sk_sp<SkTypeface> onMakeClone(const SkFontArguments& args) const override;
private:
    SkString specifiedName; // specified family name which is defined in the configuration file
    std::unique_ptr<FontInfo> fontInfo; // the font information of this typeface
};

#endif /* SKTYPEFACE_OHOS_H */
