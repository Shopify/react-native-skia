#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkAppleVideo.h"
#include <AVFoundation/AVFoundation.h>
#include <CoreVideo/CoreVideo.h>

#if !TARGET_OS_OSX
// Helper class to bridge CADisplayLink callback to C++
@interface RNSkDisplayLinkTarget : NSObject
@property(nonatomic, assign) RNSkia::RNSkAppleVideo *video;
- (void)displayLinkFired:(CADisplayLink *)sender;
@end

@implementation RNSkDisplayLinkTarget
- (void)displayLinkFired:(CADisplayLink *)sender {
  if (_video) {
    _video->onDisplayLink();
  }
}
@end
#endif

namespace RNSkia {

RNSkAppleVideo::RNSkAppleVideo(std::string url, RNSkPlatformContext *context)
    : _url(std::move(url)), _context(context) {
  setupPlayer();
  setupDisplayLink();
}

RNSkAppleVideo::~RNSkAppleVideo() {
#if !TARGET_OS_OSX
  if (_displayLink) {
    [_displayLink invalidate];
    _displayLink = nullptr;
  }
  if (_displayLinkTarget) {
    [_displayLinkTarget setVideo:nullptr];
    _displayLinkTarget = nullptr;
  }
#else
  if (_displayLink) {
    CVDisplayLinkStop(_displayLink);
    CVDisplayLinkRelease(_displayLink);
    _displayLink = nullptr;
  }
#endif
  if (_endObserver) {
    [[NSNotificationCenter defaultCenter] removeObserver:_endObserver];
    _endObserver = nullptr;
  }
  if (_player) {
    [_player pause];
  }
}

void RNSkAppleVideo::setupPlayer() {
  NSURL *videoURL = [NSURL URLWithString:@(_url.c_str())];
  AVPlayerItem *playerItem = [AVPlayerItem playerItemWithURL:videoURL];
  _player = [AVPlayer playerWithPlayerItem:playerItem];
  _playerItem = playerItem;
  _player.actionAtItemEnd = AVPlayerActionAtItemEndNone;

  NSDictionary *outputSettings = getOutputSettings();
  _videoOutput =
      [[AVPlayerItemVideoOutput alloc] initWithOutputSettings:outputSettings];
  [playerItem addOutput:_videoOutput];

  CMTime time = playerItem.asset.duration;
  if (time.timescale != 0) {
    _duration = CMTimeGetSeconds(time) * 1000; // Store duration in milliseconds
  }

  AVAssetTrack *videoTrack =
      [[playerItem.asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
  if (videoTrack) {
    _framerate = videoTrack.nominalFrameRate;
    _preferredTransform = videoTrack.preferredTransform;
    CGSize videoSize = videoTrack.naturalSize;
    _videoWidth = videoSize.width;
    _videoHeight = videoSize.height;
  }

  // Set up end-of-playback observer
  __weak AVPlayer *weakPlayer = _player;
  _endObserver = [[NSNotificationCenter defaultCenter]
      addObserverForName:AVPlayerItemDidPlayToEndTimeNotification
                  object:playerItem
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *note) {
                if (_isLooping) {
                  [weakPlayer seekToTime:kCMTimeZero
                         toleranceBefore:kCMTimeZero
                          toleranceAfter:kCMTimeZero
                       completionHandler:nil];
                } else {
                  _isPlaying = false;
                }
              }];
}

void RNSkAppleVideo::setupDisplayLink() {
#if !TARGET_OS_OSX
  _displayLinkTarget = [[RNSkDisplayLinkTarget alloc] init];
  [_displayLinkTarget setVideo:this];

  _displayLink =
      [CADisplayLink displayLinkWithTarget:_displayLinkTarget
                                  selector:@selector(displayLinkFired:)];
  [_displayLink addToRunLoop:[NSRunLoop mainRunLoop]
                     forMode:NSRunLoopCommonModes];
  _displayLink.paused = YES; // Start paused, will unpause when play() is called
#else
  // Create CVDisplayLink for macOS
  CVDisplayLinkCreateWithActiveCGDisplays(&_displayLink);
  CVDisplayLinkSetOutputCallback(_displayLink, &displayLinkCallback, this);
  _displayLinkRunning = false;
#endif
}

void RNSkAppleVideo::onDisplayLink() {
  CMTime outputItemTime =
      [_videoOutput itemTimeForHostTime:CACurrentMediaTime()];

  if ([_videoOutput hasNewPixelBufferForItemTime:outputItemTime]) {
    CMTime actualItemTime = kCMTimeZero;
    CVPixelBufferRef pixelBuffer =
        [_videoOutput copyPixelBufferForItemTime:outputItemTime
                              itemTimeForDisplay:&actualItemTime];
    if (pixelBuffer) {
      _lastImage = _context->makeImageFromNativeBuffer((void *)pixelBuffer);
      _lastFrameTimeMs = CMTimeGetSeconds(actualItemTime) * 1000;
      CVPixelBufferRelease(pixelBuffer);

      if (_waitingForFrame) {
        _waitingForFrame = false;
        // If paused and we got the frame we were waiting for, pause the display
        // link
        if (!_isPlaying) {
#if !TARGET_OS_OSX
          _displayLink.paused = YES;
#else
          stopDisplayLink();
#endif
        }
      }
    }
  }
}

void RNSkAppleVideo::expectFrame() {
  _waitingForFrame = true;
#if !TARGET_OS_OSX
  _displayLink.paused = NO;
#else
  startDisplayLink();
#endif
}

#if TARGET_OS_OSX
CVReturn RNSkAppleVideo::displayLinkCallback(CVDisplayLinkRef displayLink,
                                             const CVTimeStamp *now,
                                             const CVTimeStamp *outputTime,
                                             CVOptionFlags flagsIn,
                                             CVOptionFlags *flagsOut,
                                             void *context) {
  RNSkAppleVideo *video = static_cast<RNSkAppleVideo *>(context);
  // Dispatch to main thread since video operations need to happen there
  dispatch_async(dispatch_get_main_queue(), ^{
    video->onDisplayLink();
  });
  return kCVReturnSuccess;
}

void RNSkAppleVideo::startDisplayLink() {
  if (_displayLink && !_displayLinkRunning) {
    CVDisplayLinkStart(_displayLink);
    _displayLinkRunning = true;
  }
}

void RNSkAppleVideo::stopDisplayLink() {
  if (_displayLink && _displayLinkRunning) {
    CVDisplayLinkStop(_displayLink);
    _displayLinkRunning = false;
  }
}
#endif

sk_sp<SkImage> RNSkAppleVideo::nextImage(double *timeStamp) {
  if (timeStamp) {
    *timeStamp = CMTimeGetSeconds([_player currentTime]);
  }
  return _lastImage;
}

NSDictionary *RNSkAppleVideo::getOutputSettings() {
  return @{
    (id)kCVPixelBufferPixelFormatTypeKey : @(kCVPixelFormatType_32BGRA),
    (id)kCVPixelBufferMetalCompatibilityKey : @YES
  };
}

float RNSkAppleVideo::getRotationInDegrees() {
  CGFloat rotationAngle = 0.0;
  auto transform = _preferredTransform;
  if (transform.a == 0 && transform.b == 1 && transform.c == -1 &&
      transform.d == 0) {
    rotationAngle = 90;
  } else if (transform.a == 0 && transform.b == -1 && transform.c == 1 &&
             transform.d == 0) {
    rotationAngle = 270;
  } else if (transform.a == -1 && transform.b == 0 && transform.c == 0 &&
             transform.d == -1) {
    rotationAngle = 180;
  }
  return rotationAngle;
}

void RNSkAppleVideo::seek(double timeInMilliseconds) {
  CMTime seekTime =
      CMTimeMakeWithSeconds(timeInMilliseconds / 1000.0, NSEC_PER_SEC);
  CMTime previousTime = [_player currentTime];

  [_player seekToTime:seekTime
        toleranceBefore:kCMTimeZero
         toleranceAfter:kCMTimeZero
      completionHandler:^(BOOL finished) {
        if (finished &&
            CMTimeCompare([_player currentTime], previousTime) != 0) {
          // Ensure a frame is extracted after seek, even when paused
          expectFrame();
        }
      }];
}

void RNSkAppleVideo::play() {
  if (_player) {
    [_player play];
    _isPlaying = true;
#if !TARGET_OS_OSX
    _displayLink.paused = NO;
#else
    startDisplayLink();
#endif
  }
}

void RNSkAppleVideo::pause() {
  if (_player) {
    [_player pause];
    _isPlaying = false;
    // Only pause display link if not waiting for a frame
    if (!_waitingForFrame) {
#if !TARGET_OS_OSX
      _displayLink.paused = YES;
#else
      stopDisplayLink();
#endif
    }
  }
}

double RNSkAppleVideo::duration() { return _duration; }

double RNSkAppleVideo::framerate() { return _framerate; }

double RNSkAppleVideo::currentTime() {
  // Return the timestamp of the last captured frame for accurate
  // synchronization
  return _lastFrameTimeMs;
}

SkISize RNSkAppleVideo::getSize() {
  return SkISize::Make(_videoWidth, _videoHeight);
}

void RNSkAppleVideo::setVolume(float volume) { _player.volume = volume; }

void RNSkAppleVideo::setLooping(bool looping) { _isLooping = looping; }

bool RNSkAppleVideo::isPlaying() { return _isPlaying; }

} // namespace RNSkia
