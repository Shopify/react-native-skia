/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "demuxer.h"
#include <multimedia/player_framework/native_averrors.h>
#include <sys/stat.h>
#include <glog/logging.h>

namespace RNSkia {

Demuxer::~Demuxer()
{
    Release();
}

int32_t Demuxer::CreateDemuxer(SampleInfo &info)
{
    DLOG(INFO) << "CreateDemuxer enter";
    if(info.inputFd != -1)
    {
        DLOG(INFO) << "CreateDemuxer OH_AVSource_CreateWithFD";
        source = OH_AVSource_CreateWithFD(info.inputFd, info.inputFileOffset, info.inputFileSize);
        if (source == nullptr) {
            DLOG(ERROR) << "OH_AVSource_CreateWithFD source failed";
            return AV_ERR_UNKNOWN;
        }
    } else {
        DLOG(INFO) << "CreateDemuxer OH_AVSource_CreateWithURI";
        size_t length = info.uri.length();
        char* localUri = new char[length + 1]; // 分配额外空间用于null终止符
        strncpy(localUri, info.uri.c_str(), length); // 复制字符串内容
        localUri[length] = '\0'; // 添加null终止符

        source = OH_AVSource_CreateWithURI(localUri);
        delete[] localUri; // 清理分配的内存
        if (source == nullptr) {
            DLOG(ERROR) << "OH_AVSource_CreateWithURI source failed";
            return AV_ERR_UNKNOWN;
        }
    }
    
    demuxer = OH_AVDemuxer_CreateWithSource(source);
    if (demuxer == nullptr) {
        DLOG(ERROR) << "create demuxer failed";
        return AV_ERR_UNKNOWN;
    }

    auto sourceFormat = std::shared_ptr<OH_AVFormat>(OH_AVSource_GetSourceFormat(source), OH_AVFormat_Destroy);
    if (sourceFormat == nullptr) {
        DLOG(ERROR) << "get source format failed";
        return AV_ERR_UNKNOWN;
    }

    int32_t ret = GetTrackInfo(sourceFormat, info);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) << "get track info failed";
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t Demuxer::GetTrackInfo(std::shared_ptr<OH_AVFormat> sourceFormat, SampleInfo &info)
{
    int32_t trackCount = 0;
    OH_AVFormat_GetIntValue(sourceFormat.get(), OH_MD_KEY_TRACK_COUNT, &trackCount);
    for (int32_t index = 0; index < trackCount; index++) {
        int trackType = -1;
        auto trackFormat = std::shared_ptr<OH_AVFormat>(OH_AVSource_GetTrackFormat(source, index), OH_AVFormat_Destroy);
        OH_AVFormat_GetIntValue(trackFormat.get(), OH_MD_KEY_TRACK_TYPE, &trackType);
        if (trackType == MEDIA_TYPE_VID) {
            OH_AVDemuxer_SelectTrackByID(demuxer, index);
            OH_AVFormat_GetIntValue(trackFormat.get(), OH_MD_KEY_WIDTH, &info.videoWidth);
            OH_AVFormat_GetIntValue(trackFormat.get(), OH_MD_KEY_HEIGHT, &info.videoHeight);
            OH_AVFormat_GetDoubleValue(trackFormat.get(), OH_MD_KEY_FRAME_RATE, &info.frameRate);
            OH_AVFormat_GetLongValue(trackFormat.get(), OH_MD_KEY_BITRATE, &info.bitrate);
            OH_AVFormat_GetIntValue(trackFormat.get(), OH_MD_KEY_VIDEO_IS_HDR_VIVID, &info.isHDRVivid);
            OH_AVFormat_GetIntValue(trackFormat.get(), OH_MD_KEY_ROTATION, &info.rotate);
            OH_AVFormat_GetLongValue(sourceFormat.get(), OH_MD_KEY_DURATION, &info.duration);
            //OH_AVFormat_GetIntValue(sourceFormat.get(), OH_MD_KEY_PIXEL_FORMAT, &info.pixelFormat);
            
            char *codecMime;
            OH_AVFormat_GetStringValue(trackFormat.get(), OH_MD_KEY_CODEC_MIME, const_cast<char const **>(&codecMime));
            info.codecMime = codecMime;
            OH_AVFormat_GetIntValue(trackFormat.get(), OH_MD_KEY_PROFILE, &info.hevcProfile);
            videoTrackId_ = index;
            DLOG(INFO) <<"info.videoWidth :"<<info.videoWidth <<" videoHeight: "<<info.videoHeight <<" frameRate: "<<info.frameRate
            <<" bitrate :"<<info.bitrate<<" rotation: "<<info.rotate<<" duration: "<<info.duration<<" pixelFormat :"<<info.pixelFormat;
        }
           else if (trackType == MEDIA_TYPE_AUD) {
            OH_AVDemuxer_SelectTrackByID(demuxer, index);
            OH_AVFormat_GetLongValue(trackFormat.get(), OH_MD_KEY_BITRATE, &info.audioBitrate);
            OH_AVFormat_GetIntValue(trackFormat.get(),
                OH_MD_KEY_AUD_SAMPLE_RATE, reinterpret_cast<int32_t *>(&info.sampleRate));
            OH_AVFormat_GetIntValue(trackFormat.get(),
                OH_MD_KEY_AUD_CHANNEL_COUNT, reinterpret_cast<int32_t *>(&info.channelCount));

            char *audioCodecMime;
            OH_AVFormat_GetStringValue(trackFormat.get(),
                OH_MD_KEY_CODEC_MIME, const_cast<char const **>(&audioCodecMime));
            info.audioCodecMime = audioCodecMime;
            audioTrackId_ = index;
        }
    }
    sampleInfo = info;
    return AV_ERR_OK;
}

int32_t Demuxer::ReadSample(OH_AVBuffer *buffer, OH_AVCodecBufferAttr &attr)
{
//     DLOG(INFO) << "ReadSample enter.";
    int32_t ret = OH_AVDemuxer_ReadSampleBuffer(demuxer, videoTrackId_, buffer);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) << "read sample failed";
        return AV_ERR_UNKNOWN;
    }
    
    ret = OH_AVBuffer_GetBufferAttr(buffer, &attr);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) << "get buffer attr failed";
        return AV_ERR_UNKNOWN;
    }
    this->buffer = buffer;
    return AV_ERR_OK;
}

int32_t Demuxer::ReadAudioSample(OH_AVBuffer *buffer, OH_AVCodecBufferAttr &attr)
{
    int32_t ret = OH_AVDemuxer_ReadSampleBuffer(demuxer, audioTrackId_, buffer);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) << "read audio sample failed";
        return AV_ERR_UNKNOWN;
    }

    ret = OH_AVBuffer_GetBufferAttr(buffer, &attr);
    if (ret != AV_ERR_OK) {
        DLOG(ERROR) << "get audio buffer attr failed";
        return AV_ERR_UNKNOWN;
    }
    return AV_ERR_OK;
}

int32_t Demuxer::Release()
{
    if (source != nullptr) {
        OH_AVSource_Destroy(source);
        source = nullptr;
    }
    if (demuxer != nullptr) {
        OH_AVDemuxer_Destroy(demuxer);
        demuxer = nullptr;
    }
    return AV_ERR_OK;
}

} // namespace RNSkia