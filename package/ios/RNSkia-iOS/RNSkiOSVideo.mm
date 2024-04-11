#pragma once

#include <string>
#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkiOSVideo.h"
#include <CoreVideo/CoreVideo.h>
#include <AVFoundation/AVFoundation.h>

namespace RNSkia {

RNSkiOSVideo::RNSkiOSVideo(std::string url, RNSkPlatformContext* context) : _url(std::move(url)), _context(context) {
    initializeReader();
}

RNSkiOSVideo::~RNSkiOSVideo() {
}

void RNSkiOSVideo::initializeReader() {
    NSError* error = nil;
    NSURL* videoURL = [NSURL URLWithString:[NSString stringWithUTF8String:_url.c_str()]];
    AVAsset* asset = [AVAsset assetWithURL:videoURL];
    _reader = [[AVAssetReader alloc] initWithAsset:asset error:&error];
    
    AVAssetTrack* videoTrack = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
    NSDictionary* outputSettings = @{(NSString*)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA)};
    _trackOutput = [[AVAssetReaderTrackOutput alloc] initWithTrack:videoTrack outputSettings:outputSettings];
    [_reader addOutput:_trackOutput];
    
    [_reader startReading];
}

sk_sp<SkImage> RNSkiOSVideo::nextImage(double* timeStamp) {
    CMSampleBufferRef sampleBuffer = [_trackOutput copyNextSampleBuffer];
    if (sampleBuffer) {
        CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
        
        // TODO: use the iOS platform context directly
        auto skImage = _context->makeImageFromPlatformBuffer(reinterpret_cast<void *>(imageBuffer));

        if (timeStamp != nullptr) {
            CMTime time = CMSampleBufferGetPresentationTimeStamp(sampleBuffer);
            *timeStamp = CMTimeGetSeconds(time);
        }
        
        CFRelease(sampleBuffer); // Don't forget to release the CMSampleBufferRef
        return skImage;
    }
    return nullptr;
}

} // namespace RNSkia

// Remember to define makeSkiaImageFromCVBuffer somewhere in your project.
