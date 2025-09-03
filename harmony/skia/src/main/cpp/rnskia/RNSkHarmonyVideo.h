/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef RN_SK_HARMONY_VIDEO_H
#define RN_SK_HARMONY_VIDEO_H

#include <rawfile/raw_file_manager.h>
#include <string>
#include "RNSkVideo.h"
#include "audio_decoder.h"
#include "RNSkPlatformContext.h"

#include <bits/alltypes.h>
#include <mutex>
#include <memory>
#include <atomic>
#include <thread>
#include <unistd.h>

#include "decoder.h"
#include "demuxer.h"
#include "sample_info.h"
#include <ohaudio/native_audiorenderer.h>
#include <ohaudio/native_audiostreambuilder.h>


namespace RNSkia {

class RNSkHarmonyVideo : public RNSkVideo {
public:
    RNSkHarmonyVideo() {}
    static RNSkHarmonyVideo *GetInstance()
    {
        return &RNSkHarmonyVideo::HarmonyVideo;
    }
    
    RNSkHarmonyVideo(std::string url, RNSkPlatformContext *context, const NativeResourceManager *nativeResourceManager)
    : URI(url), context(context) ,nativeResMgr(nativeResourceManager) {
        this->nativeResMgr = nativeResourceManager;
        sampleInfo_.uri = URI;
        Init(sampleInfo_);
    }
    ~RNSkHarmonyVideo();
    
    bool IsRunning() { return isStarted_; }
    
    int32_t OpenFile(SampleInfo &sampleInfo);
    int32_t Init(SampleInfo &sampleInfo);
    int32_t Start();
    
    void StartRelease();
    void ReleaseVideo();
    void ReleaseAudio();
    void ReleaseThread();
    
    void SetLoop(int32_t loops = 1) { loops_ = loops; }
    
    RNSkPlatformContext *context;
    const NativeResourceManager *nativeResMgr;
    
    std::string DEFAULT_ASSETS_DEST = "assets/";
    std::string DEFAULT_HTTP_DEST = "http";
private:
    
    static RNSkHarmonyVideo HarmonyVideo;
    int32_t loops_ = 1;
    uint32_t flags;
    std::string URI;
    int32_t frameCount = 0;
    int64_t milliseconds = 0;
    int32_t loops = 1;
    
    SampleInfo sampleInfo_;
    
    std::mutex mutex_;
    std::mutex pauseMutex_;
    std::condition_variable pauseCond_;
    
    void DecAudioInputThread();
    void DecAudioOutputThread();
    void DecVideoInputThread();
    void DecVideoOutputThread();
    
    int32_t InitAudio();
    void InitControlSignal();
    void InitAudioPlayer(AudioInitData audioInitData);

    std::condition_variable doneCond_;
    std::unique_ptr<Demuxer> demuxer_ = nullptr;
    
    std::unique_ptr<VideoDecoder> videoDecoder_ = nullptr;
    std::unique_ptr<AudioDecoder> audioDecoder_ = nullptr;
    
    
    OH_NativeBuffer *nativeBuffer = nullptr;
    ADecSignal *audioSignal_ = nullptr;
    VDecSignal *videoSignal_ = nullptr;
    OH_AudioStreamBuilder* builder_ = nullptr;
    OH_AudioRenderer* audioRenderer_ = nullptr;
    
    std::atomic<bool> isPause_{false};
    std::atomic<bool> isStop_{false};
    std::atomic<bool> isVideoEnd_{false};
    std::atomic<bool> isAudioEnd_{false};
    std::atomic<bool> isEndOfFile_{false};
    std::atomic<bool> isVideoEndOfFile_{false};
    std::atomic<bool> isStarted_{false};
    std::atomic<bool> isReleased_{false};
    
    std::unique_ptr<std::thread> decAudioInputThread_ = nullptr;
    std::unique_ptr<std::thread> decAudioOutputThread_ = nullptr;
    std::unique_ptr<std::thread> decVideoInputThread_ = nullptr;
    std::unique_ptr<std::thread> decVideoOutputThread_ = nullptr;
    
    static constexpr int32_t DEFAULT_FRAME_RATE = 30;
    static constexpr int32_t ONEK = 1024;
    static constexpr int32_t AUDIO_SLEEP_TIME = 300;
    static constexpr int64_t MICROSECOND = 1000000;
    
public:
    
    sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
    double duration() override;
    double framerate() override;
    void seek(double timestamp) override;
    float getRotationInDegrees() override;
    SkISize getSize() override;
    void play() override;
    void pause() override;
    void setVolume(float volume) override;
    
};

} // namespace RNSkia

#endif // RN_SK_HARMONY_VIDEO_H
