/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "sample_callback.h"
#include <glog/logging.h>
namespace {
constexpr int LIMIT_LOGD_FREQUENCY = 50;
}

// 自定义写入数据函数
int32_t SampleCallback::OnRenderWriteData(OH_AudioRenderer *renderer, void *userData, void *buffer, int32_t length)
{
    if (userData == nullptr || buffer == nullptr) {
        DLOG(INFO) << "OnRenderWriteData con not get userData";
        return 1;
    }
    (void)renderer;
    (void)length;
    RNSkia::ADecSignal *codecUserData = static_cast<RNSkia::ADecSignal *>(userData);
    
    // 将待播放的数据，按length长度写入buffer
    uint8_t *dest = (uint8_t *)buffer;
    size_t index = 0;
    std::unique_lock<std::mutex> lock(codecUserData->audioOutputMutex_);
    // 从队列中取出需要播放的长度为length的数据
    while (!codecUserData->renderQueue.empty() && index < length) {
        dest[index++] = codecUserData->renderQueue.front();
        codecUserData->renderQueue.pop();
    }
    DLOG(INFO) <<"render BufferLength: "<<length<< " renderQueue.size: "<<codecUserData->renderQueue.size()<<" renderReadSize: "<< index;

    if (codecUserData->renderQueue.size() < length) {
        codecUserData->renderCond.notify_all();
    }
    return 0;
}
// 自定义音频流事件函数
int32_t SampleCallback::OnRenderStreamEvent(OH_AudioRenderer *renderer, void *userData, OH_AudioStream_Event event)
{
    (void)renderer;
    (void)userData;
    (void)event;
    // 根据event表示的音频流事件信息，更新播放器状态和界面
    return 0;
}
// 自定义音频中断事件函数
int32_t SampleCallback::OnRenderInterruptEvent(OH_AudioRenderer *renderer,
    void *userData, OH_AudioInterrupt_ForceType type, OH_AudioInterrupt_Hint hint)
{
    (void)renderer;
    (void)userData;
    (void)type;
    (void)hint;
    if (userData == nullptr) {
        DLOG(INFO) <<"OnRenderWriteData con not get userData";
        return 1;
    }
    RNSkia::ADecSignal *codecUserData = static_cast<RNSkia::ADecSignal *>(userData);
    codecUserData->isInterrupt = true;
    DLOG(INFO) <<"audio RenderInterruptEvent type: "<<type<<" hint: "<<hint;
    return 0;
}
// 自定义异常回调函数
int32_t SampleCallback::OnRenderError(OH_AudioRenderer *renderer, void *userData, OH_AudioStream_Result error)
{
    (void)renderer;
    (void)userData;
    (void)error;
     DLOG(ERROR) <<"OnRenderError";
    // 根据error表示的音频异常信息，做出相应的处理
    return 0;
}

void SampleCallback::OnCodecError(OH_AVCodec *codec, int32_t errorCode, void *userData)
{
    (void)codec;
    (void)errorCode;
    (void)userData;
    DLOG(INFO) <<"On codec error, error code: "<<errorCode;
}

void SampleCallback::OnCodecFormatChange(OH_AVCodec *codec, OH_AVFormat *format, void *userData)
{
    DLOG(INFO) <<"On codec format change";
}

void SampleCallback::OnNeedInputBuffer(OH_AVCodec *codec, uint32_t index, OH_AVBuffer *buffer, void *userData)
{
    if (userData == nullptr) {
        return;
    }
    (void)codec;
    RNSkia::VDecSignal *codecUserData = static_cast<RNSkia::VDecSignal *>(userData);
    std::unique_lock<std::mutex> lock(codecUserData->inputMutex_);
    codecUserData->inputBufferInfoQueue_.emplace(index, buffer);
    codecUserData->videoInputCond_.notify_all();
}

void SampleCallback::OnNewOutputBuffer(OH_AVCodec *codec, uint32_t index, OH_AVBuffer *buffer, void *userData)
{
    if (userData == nullptr) {
        return;
    }
    (void)codec;
    RNSkia::VDecSignal *codecUserData = static_cast<RNSkia::VDecSignal *>(userData);
    std::unique_lock<std::mutex> lock(codecUserData->outputMutex_);
    codecUserData->outputBufferInfoQueue_.emplace(index, buffer);
    codecUserData->videoOutputCond_.notify_all();
}
