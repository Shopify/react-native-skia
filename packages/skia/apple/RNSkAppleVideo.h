#pragma once

#include <string>

#include <AVFoundation/AVFoundation.h>
#include <CoreVideo/CoreVideo.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/core/SkSize.h"

#pragma clang diagnostic pop

#include "RNSkPlatformContext.h"
#include "RNSkVideo.h"

namespace RNSkia {

class RNSkAppleVideo : public RNSkVideo {
private:
  std::string _url;
  AVPlayer *_player = nullptr;
  AVPlayerItem *_playerItem = nullptr;
  AVPlayerItemVideoOutput *_videoOutput = nullptr;
#if !TARGET_OS_OSX
  CADisplayLink *_displayLink = nullptr;
  id _displayLinkTarget = nullptr;
#else
  CVDisplayLinkRef _displayLink = nullptr;
  bool _displayLinkRunning = false;
#endif
  RNSkPlatformContext *_context;
  double _duration = 0;
  double _framerate = 0;
  float _videoWidth = 0;
  float _videoHeight = 0;
  CGAffineTransform _preferredTransform;
  bool _isPlaying = false;
  bool _isLooping = false;
  bool _waitingForFrame = false;
  id _endObserver = nullptr;
  sk_sp<SkImage> _lastImage = nullptr;
  double _lastFrameTimeMs = 0;
  void setupPlayer();
  void setupDisplayLink();
  NSDictionary *getOutputSettings();
#if TARGET_OS_OSX
  void startDisplayLink();
  void stopDisplayLink();
  static CVReturn displayLinkCallback(CVDisplayLinkRef displayLink,
                                      const CVTimeStamp *now,
                                      const CVTimeStamp *outputTime,
                                      CVOptionFlags flagsIn,
                                      CVOptionFlags *flagsOut, void *context);
#endif

public:
  void onDisplayLink();
  void expectFrame();
  RNSkAppleVideo(std::string url, RNSkPlatformContext *context);
  ~RNSkAppleVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
  double duration() override;
  double framerate() override;
  double currentTime() override;
  void seek(double timestamp) override;
  void play() override;
  void pause() override;
  float getRotationInDegrees() override;
  SkISize getSize() override;
  void setVolume(float volume) override;
  void setLooping(bool looping) override;
  bool isPlaying() override;
};

} // namespace RNSkia
