/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#if SK_BUILD_FONT_MGR_FOR_OHOS
#include "SkFontMgr.h"
SK_API sk_sp<SkFontMgr> SkFontMgr_New_OHOS(const char* path);

/*! To implement the porting layer to return the default factory for Harmony platform
 * \return the default font manager for Harmony platform
 */
sk_sp<SkFontMgr> SkFontMgr::Factory()
{
    return SkFontMgr_New_OHOS();
}
#endif /* SK_BUILD_FONT_MGR_FOR_OHOS */