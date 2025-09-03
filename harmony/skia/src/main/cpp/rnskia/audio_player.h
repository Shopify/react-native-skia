/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_AUDIO_PLAYER_H
#define HARMONY_AUDIO_PLAYER_H

#include <mutex>
#include <ohaudio/native_audiorenderer.h>
#include <ohaudio/native_audiostream_base.h>
#include <string>

namespace RNSkia {
struct AudioControlData {
    std::mutex mutex_;
    std::vector<uint8_t> buffer;
    std::vector<uint8_t> tmpBuffer;
    int32_t curIndex = 0;
    bool isStop = false;
    bool isEOS = false;
};

struct AudioInitData {
    OH_AudioStream_Type type = AUDIOSTREAM_TYPE_RENDERER;
    int32_t samplingRate = 48000;
    int32_t channelCount = 2;
    OH_AudioStream_SampleFormat format = AUDIOSTREAM_SAMPLE_S16LE;
    OH_AudioStream_EncodingType encodingType = AUDIOSTREAM_ENCODING_TYPE_RAW;
    OH_AudioStream_Usage usage = AUDIOSTREAM_USAGE_MUSIC;
};

class AudioPlayer {
public:
    AudioPlayer() {};
    ~AudioPlayer();
    void Release();
    void SetBuffer(std::vector<uint8_t> buffer);
    void InsertBuffer(std::vector<uint8_t> buffer);

    void SetVolume(float volume);

    void Init(AudioInitData audioInitData);
    void Start() { OH_AudioRenderer_Start(audioRenderer_); }
    void Stop() { OH_AudioRenderer_Stop(audioRenderer_); }
    void Pause() { OH_AudioRenderer_Pause(audioRenderer_); }

    void EndOfFile() { audioControlData_.isEOS = true; }
    bool IsStop()
    {
        return audioControlData_.isStop;
    }

    void GetState(OH_AudioStream_State *state) {OH_AudioRenderer_GetCurrentState(audioRenderer_, state);}
private:
    AudioControlData audioControlData_;
    AudioInitData audioInitData_;
    OH_AudioRenderer *audioRenderer_;
    OH_AudioStreamBuilder *builder_;
    std::string uri_;
};

} // namespace RNSkia
#endif // HARMONY_AUDIO_PLAYER_H
