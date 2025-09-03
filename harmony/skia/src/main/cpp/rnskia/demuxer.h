/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_DEMUXER_H
#define HARMONY_DEMUXER_H

#include <bits/alltypes.h>
#include "multimedia/player_framework/native_avdemuxer.h"
#include "sample_info.h"

namespace RNSkia {
class Demuxer {
public:
    ~Demuxer();
    int32_t CreateDemuxer(SampleInfo &sampleInfo);
    int32_t GetTrackInfo(std::shared_ptr<OH_AVFormat> sourceFormat, SampleInfo &info);
    int32_t ReadSample(OH_AVBuffer *buffer, OH_AVCodecBufferAttr &attr);
    int32_t ReadAudioSample(OH_AVBuffer *buffer, OH_AVCodecBufferAttr &attr);
    int32_t Release();

    bool hasAudio() { return audioTrackId_ != -1; }
    bool hasVideo() { return videoTrackId_ != -1; }
    OH_AVDemuxer *demuxer;
    SampleInfo sampleInfo;
    OH_AVBuffer *buffer = nullptr;
    int32_t videoTrackId_ = -1;
private:
    OH_AVSource *source;
    

    
    int32_t audioTrackId_ = -1;
};

} // namespace RNSkia
#endif // HARMONY_DEMUXER_H