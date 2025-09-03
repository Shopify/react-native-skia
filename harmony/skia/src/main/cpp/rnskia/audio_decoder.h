/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_AUDIO_DECODER_H
#define HARMONY_AUDIO_DECODER_H

#include "multimedia/player_framework/native_avcodec_videodecoder.h"
#include "multimedia/player_framework/native_avbuffer_info.h"
#include "sample_info.h"

namespace RNSkia {
class AudioDecoder {
public:
    AudioDecoder() = default;
    ~AudioDecoder();

    int32_t CreateAudioDecoder(const std::string &codecMime);
    int32_t ConfigureAudioDecoder(const SampleInfo &sampleInfo);
    int32_t Config(const SampleInfo &sampleInfo, ADecSignal *signal);
    int32_t StartAudioDecoder();
    int32_t PushInputData(AudioCodecBufferInfo &info);
    int32_t FreeOutputData(uint32_t bufferIndex, bool render);
    int32_t Release();
    int32_t Flush();
private:
    int32_t SetCallback(ADecSignal *signal);

    bool isAVBufferMode_ = false;
    OH_AVCodec *decoder;
};
} // namespace RNSkia
#endif // HARMONY_AUDIO_DECODER_H