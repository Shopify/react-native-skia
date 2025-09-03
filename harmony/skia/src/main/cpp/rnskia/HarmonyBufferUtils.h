/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_BUFFER_UTILS_H
#define HARMONY_BUFFER_UTILS_H

#include "native_buffer/native_buffer.h"

#include "include/gpu/GrBackendSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"

#pragma once

#include "include/gpu/GrBackendSurface.h"

extern "C" {

typedef struct OH_NativeBuffer OH_NativeBuffer;
}
class GrDirectContext;
namespace RNSkia {

typedef void *TexImageCtx;
typedef void (*DeleteImageProc)(TexImageCtx);
typedef void (*UpdateImageProc)(TexImageCtx, GrDirectContext *);

GrBackendTexture MakeGLBackendTexture(GrDirectContext *dContext, OH_NativeBuffer *Buffer,
                                     int width, int height, DeleteImageProc *deleteProc,
                                     UpdateImageProc *updateProc, TexImageCtx *imageCtx,
                                     bool isProtectedContent, const GrBackendFormat &backendFormat, bool isRenderable);

} // namespace RNSkia

#endif // HARMONY_BUFFER_UTILS_H