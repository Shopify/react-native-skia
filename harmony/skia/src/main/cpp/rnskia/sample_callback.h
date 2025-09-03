/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef SAMPLE_CALLBACK_H
#define SAMPLE_CALLBACK_H

#include <ohaudio/native_audiorenderer.h>
#include <ohaudio/native_audiostreambuilder.h>
#include "sample_info.h"

class SampleCallback {
public:
    static int32_t OnRenderWriteData(OH_AudioRenderer *renderer, void *userData, void *buffer, int32_t length);
    static int32_t OnRenderStreamEvent(OH_AudioRenderer *renderer, void *userData, OH_AudioStream_Event event);
    static int32_t OnRenderInterruptEvent(OH_AudioRenderer *renderer, void *userData, OH_AudioInterrupt_ForceType type,
                               OH_AudioInterrupt_Hint hint);
    static int32_t OnRenderError(OH_AudioRenderer *renderer, void *userData, OH_AudioStream_Result error);

    static void OnCodecError(OH_AVCodec *codec, int32_t errorCode, void *userData);
    static void OnCodecFormatChange(OH_AVCodec *codec, OH_AVFormat *format, void *userData);
    static void OnNeedInputBuffer(OH_AVCodec *codec, uint32_t index, OH_AVBuffer *buffer, void *userData);
    static void OnNewOutputBuffer(OH_AVCodec *codec, uint32_t index, OH_AVBuffer *buffer, void *userData);
};

#endif // VAP_SAMPLE_CALLBACK_H
