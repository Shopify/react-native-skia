/*
* Copyright 2024 Google Inc.
*
* Use of this source code is governed by a BSD-style license that can be
* found in the LICENSE file.
*/

#ifndef SKFONTSCANNER_FREETYPE_H_
#define SKFONTSCANNER_FREETYPE_H_

#include "include/core/SkFontScanner.h"

SK_API std::unique_ptr<SkFontScanner> SkFontScanner_Make_FreeType();

#endif // SKFONTSCANNER_FREETYPE_H_
