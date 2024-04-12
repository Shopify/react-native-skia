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
#include <mach/mach_time.h>

// To convert from SampleBufferRef to SkImage use:
// auto skImage = _context->makeImageFromPlatformBuffer(reinterpret_cast<void *>(imageBuffer));

namespace RNSkia {

RNSkiOSVideo::RNSkiOSVideo(std::string url, RNSkPlatformContext* context) : _url(std::move(url)), _context(context) {
    initializeReader();
}

RNSkiOSVideo::~RNSkiOSVideo() {
}

void RNSkiOSVideo::initializeReader() {
    NSError *error = nil;

    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL URLWithString:@(_url.c_str())] options:nil];
    AVAssetReader *assetReader = [[AVAssetReader alloc] initWithAsset:asset error:&error];
    
    if (error) {
        NSLog(@"Error initializing asset reader: %@", error.localizedDescription);
        return;
    }
    
    AVAssetTrack *videoTrack = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
    NSDictionary *outputSettings = @{(id)kCVPixelBufferPixelFormatTypeKey : @(kCVPixelFormatType_32BGRA)};
    AVAssetReaderTrackOutput *trackOutput = [[AVAssetReaderTrackOutput alloc] initWithTrack:videoTrack outputSettings:outputSettings];
    
    if ([assetReader canAddOutput:trackOutput]) {
        [assetReader addOutput:trackOutput];
        [assetReader startReading];
    } else {
        NSLog(@"Cannot add output to asset reader.");
        return;
    }
    
    _reader = assetReader;
    _trackOutput = trackOutput;
}

sk_sp<SkImage> RNSkiOSVideo::nextImage(double* timeStamp) {
    CMSampleBufferRef sampleBuffer = [_trackOutput copyNextSampleBuffer];
    if (!sampleBuffer) {
        NSLog(@"No more sample buffers.");
        return nullptr;
    }
    
//    CVPixelBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
//    if (!imageBuffer) {
//        NSLog(@"Failed to get image buffer from sample buffer.");
//        CFRelease(sampleBuffer);
//        return nullptr;
//    }
	uint64_t start = mach_absolute_time();
    // Assuming makeSkiaImageFromCVBuffer is defined and converts a CVPixelBufferRef to sk_sp<SkImage>
	auto skImage = _context->makeImageFromPlatformBuffer(reinterpret_cast<void *>(sampleBuffer));
	uint64_t end = mach_absolute_time();
	uint64_t elapsed = end - start;
	mach_timebase_info_data_t info;
	mach_timebase_info(&info);
	uint64_t nanos = elapsed * info.numer / info.denom;

	// Log the time taken
	NSLog(@"Time taken: %llu ns", nanos);
    if (timeStamp) {
        CMTime time = CMSampleBufferGetPresentationTimeStamp(sampleBuffer);
        *timeStamp = CMTimeGetSeconds(time);
    }
    
    CFRelease(sampleBuffer);
    return skImage;
}

} // namespace RNSkia

// Remember to define makeSkiaImageFromCVBuffer somewhere in your project.
