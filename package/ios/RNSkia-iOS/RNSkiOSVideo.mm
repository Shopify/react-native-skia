#pragma once

#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkiOSVideo.h"
#include <AVFoundation/AVFoundation.h>
#include <CoreVideo/CoreVideo.h>

namespace RNSkia {

RNSkiOSVideo::RNSkiOSVideo(std::string url, RNSkPlatformContext *context)
    : _url(std::move(url)), _context(context) {
  initializeReader();
}

RNSkiOSVideo::~RNSkiOSVideo() {}

void RNSkiOSVideo::initializeReader() {
     NSURL *url = [NSURL URLWithString:@(_url.c_str())];
    AVPlayerItem *playerItem = [AVPlayerItem playerItemWithURL:url];

    NSDictionary *pixelBufferAttributes = @{
        (id)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
        (id)kCVPixelBufferMetalCompatibilityKey: @YES
    };
    _videoOutput = [[AVPlayerItemVideoOutput alloc] initWithPixelBufferAttributes:pixelBufferAttributes];
    
    [playerItem addOutput:_videoOutput];

    _player = [[AVPlayer alloc] initWithPlayerItem:playerItem];
    [_player play]; // Autoplay on initialization
}

sk_sp<SkImage> RNSkiOSVideo::nextImage(double *timeStamp) {
  CMTime currentTime = [_player currentTime];
    if ([_videoOutput hasNewPixelBufferForItemTime:currentTime]) {
        CVPixelBufferRef pixelBuffer = [_videoOutput copyPixelBufferForItemTime:currentTime itemTimeForDisplay:nil];
        
        if (!pixelBuffer) {
            NSLog(@"No pixel buffer.");
            return nullptr;
        }

        auto skImage = _context->makeImageFromNativeBuffer(pixelBuffer);

        if (timeStamp) {
            *timeStamp = CMTimeGetSeconds(currentTime);
        }

        CFRelease(pixelBuffer);
        return skImage;
    }
    return nullptr;
}

} // namespace RNSkia

