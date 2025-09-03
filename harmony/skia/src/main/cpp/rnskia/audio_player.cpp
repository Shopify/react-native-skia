/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "audio_player.h"

#include <ark_runtime/jsvm.h>
#include <bits/alltypes.h>
#include <multimedia/player_framework/avplayer.h>
#include <multimedia/player_framework/avplayer_base.h>
#include <multimedia/player_framework/native_avcodec_base.h>
#include <mutex>
#include <ohaudio/native_audiorenderer.h>
#include <ohaudio/native_audiostreambuilder.h>
#include <unistd.h>
#include <glog/logging.h>

namespace RNSkia {
AudioPlayer::~AudioPlayer()
{
    Release();
}

void AudioPlayer::Release()
{
    if (audioRenderer_) {
        OH_AudioRenderer_Flush(audioRenderer_);   // 释放缓存数据
        OH_AudioRenderer_Release(audioRenderer_); //	释放播放实例
        audioRenderer_ = nullptr;
    }
    if (builder_) {
        OH_AudioStreamBuilder_Destroy(builder_);
        builder_ = nullptr;
    }
}

// 自定义写入数据函数
int32_t AudioPlayerOnWriteData(OH_AudioRenderer *renderer, void *userData, void *buffer, int32_t length)
{
    DLOG(INFO) <<"audio player AudioPlayerOnWriteData enter"; // 17832
    if (userData == nullptr || buffer == nullptr) {
        DLOG(INFO) <<"MyOnWriteData con not get userData";
        return 1;
    }
    AudioControlData *data = static_cast<AudioControlData *>(userData);
    // 将待播放的数据，按length长度写入buffer
    unsigned char *audioBuffer = (unsigned char *)buffer; // 将void指针转换为unsigned char指针
    int bufferSize = length / sizeof(unsigned char);      // 计算buffer中可以存放的unsigned char数量

    int32_t localBufferSize = data->tmpBuffer.size();
    DLOG(INFO) <<"enter LocalBufferSize: "<< localBufferSize;

    if (localBufferSize >= length) {
        std::unique_lock<std::mutex> lock(data->mutex_);
        data->buffer.assign(data->tmpBuffer.begin(), data->tmpBuffer.begin() + length);
        data->tmpBuffer.erase(data->tmpBuffer.begin(), data->tmpBuffer.begin() + length);
        lock.unlock();

        for (int i = 0; i < length; i++) {
            *audioBuffer = data->buffer[i];
            audioBuffer++;
        }
        data->buffer.clear();
    } else if (data->isEOS) {
        for (int i = 0; i < length; i++) {
            if (data->isStop) {
                *audioBuffer = 0;
                audioBuffer++;
                continue;
            }
            if (i < localBufferSize) {
                *audioBuffer = data->buffer[i];
                data->isStop = true;
            } else {
                *audioBuffer = 0;
            }
            audioBuffer++;
        }
        DLOG(INFO) <<"size < length : "<< length;
    }
    return 0;
}
// 自定义音频流事件函数
int32_t AudioPlayerOnStreamEvent(OH_AudioRenderer *renderer, void *userData, OH_AudioStream_Event event)
{
    // 根据event表示的音频流事件信息，更新播放器状态和界面
    if (userData == nullptr) {
        DLOG(INFO) <<"MyOnStreamEvent con not get userData";
        return 1;
    }
    AudioControlData *data = static_cast<AudioControlData *>(userData);
    DLOG(INFO) <<"MyOnStreamEvent event: "<< event;
    return 0;
}
// 自定义音频中断事件函数
int32_t AudioPlayerOnInterruptEvent(OH_AudioRenderer *renderer, void *userData, OH_AudioInterrupt_ForceType type,
                           OH_AudioInterrupt_Hint hint)
{
    // 根据type和hint表示的音频中断信息，更新播放器状态和界面
    if (userData == nullptr) {
        DLOG(INFO) <<"MyOnInterruptEvent con not get userData";
        return 1;
    }
    AudioControlData *data = static_cast<AudioControlData *>(userData);
    DLOG(INFO) <<"MyOnInterruptEvent type:  "<< type <<" hint:  "<< hint;
    return 0;
}
// 自定义异常回调函数
int32_t AudioPlayerOnError(OH_AudioRenderer *renderer, void *userData, OH_AudioStream_Result error)
{
    // 根据error表示的音频异常信息，做出相应的处理
    if (userData == nullptr) {
        DLOG(INFO) <<"MyOnError con not get userData";
        return 1;
    }
    AudioControlData *data = static_cast<AudioControlData *>(userData);
    DLOG(INFO) <<"MyOnError error: ,"<< error;
    return 0;
}

void AudioPlayer::SetBuffer(std::vector<uint8_t> buffer) { audioControlData_.buffer = buffer; }

void AudioPlayer::InsertBuffer(std::vector<uint8_t> buffer)
{
    std::lock_guard<std::mutex> lock(audioControlData_.mutex_);
    audioControlData_.tmpBuffer.insert(audioControlData_.tmpBuffer.end(), buffer.begin(), buffer.end());
}

void AudioPlayer::SetVolume(float volume)
{
    OH_AudioRenderer_SetVolume(audioRenderer_, volume);
}

void AudioPlayer::Init(AudioInitData audioInitData)
{
    DLOG(INFO) <<"AudioPlayer enter init";
    audioInitData_ = audioInitData;
    OH_AudioStreamBuilder_Create(&builder_, audioInitData_.type);
    // 设置音频采样率
    OH_AudioStreamBuilder_SetSamplingRate(builder_, audioInitData_.samplingRate);
    // 设置音频声道
    OH_AudioStreamBuilder_SetChannelCount(builder_, audioInitData_.channelCount);
    // 设置音频采样格式
    OH_AudioStreamBuilder_SetSampleFormat(builder_, audioInitData_.format);
    // 设置音频流的编码类型
    OH_AudioStreamBuilder_SetEncodingType(builder_, audioInitData_.encodingType);
    // 设置输出音频流的工作场景
    OH_AudioStreamBuilder_SetRendererInfo(builder_, audioInitData_.usage);

    OH_AudioRenderer_Callbacks callbacks;
    // 配置回调函数
    callbacks.OH_AudioRenderer_OnWriteData = AudioPlayerOnWriteData;
    callbacks.OH_AudioRenderer_OnStreamEvent = AudioPlayerOnStreamEvent;
    callbacks.OH_AudioRenderer_OnInterruptEvent = AudioPlayerOnInterruptEvent;
    callbacks.OH_AudioRenderer_OnError = AudioPlayerOnError;

    // 设置输出音频流的回调
    OH_AudioStreamBuilder_SetRendererCallback(builder_, callbacks, &audioControlData_);
    OH_AudioStreamBuilder_GenerateRenderer(builder_, &audioRenderer_);
}

} // namespace RNSkia