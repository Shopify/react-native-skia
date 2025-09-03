/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_DECODER_H
#define HARMONY_DECODER_H

#include "sample_info.h"

namespace RNSkia {
class VideoDecoder {
public:
    VideoDecoder() = default;
    ~VideoDecoder();

    int32_t CreateVideoDecoder(const std::string &codecMime);
    int32_t ConfigureVideoDecoder(const SampleInfo &sampleInfo);
    int32_t Config(const SampleInfo &sampleInfo, VDecSignal *signal);
    int32_t StartVideoDecoder();
    int32_t PushInputData(CodecBufferInfo &info);
    int32_t FreeOutputData(uint32_t bufferIndex, bool render);
    int32_t Release();
    int32_t Flush(CodecBufferInfo &info);
    
    SampleInfo Info;
    
private:
    int32_t SetCallback(VDecSignal *signal);

    bool isAVBufferMode_ = false;
    OH_AVCodec *decoder_;
};

} // namespace RNSkia
#endif // HARMONY_DECODER_H