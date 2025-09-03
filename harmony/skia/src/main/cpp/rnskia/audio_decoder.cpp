/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "audio_decoder.h"

#include <multimedia/player_framework/native_avcodec_audiocodec.h>
#include <multimedia/player_framework/native_avcodec_audiodecoder.h>
#include <glog/logging.h>

#undef LOG_TAG
#define LOG_TAG "AudioDecoder"

namespace RNSkia {
void OnAudioCodecError(OH_AVCodec *codec, int32_t errorCode, void *userData)
{
    (void)codec;
    (void)errorCode;
    (void)userData;
    DLOG(ERROR) <<"On codec error, error code: "<< errorCode;
}

void OnAudioCodecFormatChange(OH_AVCodec *codec, OH_AVFormat *format, void *userData)
{
    DLOG(ERROR) <<"On codec format change";
}

void OnAudioNeedInputBuffer(OH_AVCodec *codec, uint32_t index, OH_AVBuffer *buffer, void *userData)
{
    if (userData == nullptr) {
        return;
    }
    (void)codec;
    ADecSignal *m_signal = static_cast<ADecSignal *>(userData);
    std::unique_lock<std::mutex> lock(m_signal->audioInputMutex_);
    m_signal->audioInputBufferInfoQueue_.emplace(index, buffer, codec);
    m_signal->audioInputCond_.notify_all();
}

void OnAudioNewOutputBuffer(OH_AVCodec *codec, uint32_t index, OH_AVBuffer *buffer, void *userData)
{
    if (userData == nullptr) {
        return;
    }
    (void)codec;
    ADecSignal *m_signal = static_cast<ADecSignal *>(userData);
    std::unique_lock<std::mutex> lock(m_signal->audioOutputMutex_);
    m_signal->audioOutputBufferInfoQueue_.emplace(index, buffer, codec);
    m_signal->audioOutputCond_.notify_all();
}

AudioDecoder::~AudioDecoder()
{
    Release();
}

int32_t AudioDecoder::CreateAudioDecoder(const std::string &codecMime)
{
    decoder = OH_AudioCodec_CreateByMime(codecMime.c_str(), false);
    if (decoder == nullptr) {
        DLOG(ERROR) <<"create audio decoder failed";
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t AudioDecoder::SetCallback(ADecSignal *signal)
{
    int32_t ret = AV_ERR_OK;
    ret = OH_AudioCodec_RegisterCallback(decoder, {OnAudioCodecError, OnAudioCodecFormatChange,
                                            OnAudioNeedInputBuffer, OnAudioNewOutputBuffer}, signal);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"Set callback failed, ret: "<< ret;
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t AudioDecoder::ConfigureAudioDecoder(const SampleInfo &sampleInfo)
{
    OH_AVFormat *format = OH_AVFormat_Create();
    if (format == nullptr) {
        DLOG(ERROR) <<"AVFormat create failed";
        return AV_ERR_UNKNOWN;
    }
    OH_AVFormat_SetIntValue(format, OH_MD_KEY_AUD_SAMPLE_RATE, sampleInfo.sampleRate);
    OH_AVFormat_SetLongValue(format, OH_MD_KEY_BITRATE, sampleInfo.audioBitrate);
    OH_AVFormat_SetIntValue(format, OH_MD_KEY_AUD_CHANNEL_COUNT, sampleInfo.channelCount);
    if (strcmp(sampleInfo.audioCodecMime.c_str(), "audio/mp4a-latm") == 0) {
        OH_AVFormat_SetIntValue(format, OH_MD_KEY_AAC_IS_ADTS, 1);
        DLOG(INFO) <<"audio mime is aac";
    } else {
        DLOG(INFO) <<"audio mime is not aac";
    }
//     DLOG(INFO) <<"AudioDecoder config: %{public}d - %{public}ld = %{public}d", sampleInfo.sampleRate,
//         sampleInfo.audioBitrate, sampleInfo.channelCount;
    int ret = OH_AudioCodec_Configure(decoder, format);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"Config failed, ret: "<< ret;
        return AV_ERR_UNKNOWN;
    }
    OH_AVFormat_Destroy(format);
    format = nullptr;

    return AV_ERR_OK;
}

int32_t AudioDecoder::Config(const SampleInfo &sampleInfo, ADecSignal *signal)
{
    if (decoder == nullptr) {
        DLOG(ERROR) <<"Decoder is null";
        return AV_ERR_UNKNOWN;
    }
    if (signal == nullptr) {
        DLOG(ERROR) <<"Invalid param: codecUserData";
        return AV_ERR_UNKNOWN;
    }

    int32_t ret = ConfigureAudioDecoder(sampleInfo);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"Configure failed";
        return AV_ERR_UNKNOWN;
    }

    ret = SetCallback(signal);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"Set callback failed, ret: "<< ret;
        return AV_ERR_UNKNOWN;
    }

    {
        int ret = OH_AudioCodec_Prepare(decoder);
        if (ret != AV_ERR_OK) {
            DLOG(ERROR) <<"audio Prepare failed, ret: "<< ret;
            return AV_ERR_UNKNOWN;
        }
    }

    return AV_ERR_OK;
}

int32_t AudioDecoder::StartAudioDecoder()
{
    if (decoder == nullptr) {
        DLOG(ERROR) <<"Decoder is null";
        return AV_ERR_UNKNOWN;
    }

    int ret = OH_AudioCodec_Start(decoder);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"audio Start failed, ret: "<< ret;
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t AudioDecoder::PushInputData(AudioCodecBufferInfo &info)
{
    if (decoder == nullptr) {
        DLOG(ERROR) <<"Decoder is null";
        return AV_ERR_UNKNOWN;
    }
    int32_t ret = OH_AVBuffer_SetBufferAttr(info.bufferOrigin, &info.attr);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"Set avbuffer attr failed";
        return AV_ERR_UNKNOWN;
    }
    ret = OH_AudioCodec_PushInputBuffer(decoder, info.bufferIndex);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"Push input data failed";
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t AudioDecoder::FreeOutputData(uint32_t bufferIndex, bool render)
{
    if (decoder == nullptr) {
        DLOG(ERROR) <<"Decoder is null";
        return AV_ERR_UNKNOWN;
    }

    int32_t ret = AV_ERR_OK;
    ret = OH_AudioCodec_FreeOutputBuffer(decoder, bufferIndex);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) <<"audio Free output data failed";
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t AudioDecoder::Release()
{
    if (decoder != nullptr) {
        OH_AudioCodec_Flush(decoder);
        OH_AudioCodec_Stop(decoder);
        OH_AudioCodec_Destroy(decoder);
        decoder = nullptr;
    }
    return AV_ERR_OK;
}

int32_t AudioDecoder::Flush()
{
    if(decoder!=nullptr){
        OH_AudioCodec_Flush(decoder);
    }
    return AV_ERR_OK;
}

} // namespace RNSkia
