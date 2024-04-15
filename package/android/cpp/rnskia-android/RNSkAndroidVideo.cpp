#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>

#include <memory>
#include <string>

#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkAndroidVideo.h"
#include "RNSkLog.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

static AMediaExtractor *createExtractorFromFD(FILE *fp) {
  AMediaExtractor *extractor = nullptr;
  struct stat buf {};
  if (fp && !fstat(fileno(fp), &buf)) {
    extractor = AMediaExtractor_new();
    media_status_t res =
        AMediaExtractor_setDataSourceFd(extractor, fileno(fp), 0, buf.st_size);
    if (res != AMEDIA_OK) {
      AMediaExtractor_delete(extractor);
      extractor = nullptr;
    }
  }
  return extractor;
}

RNSkAndroidVideo::RNSkAndroidVideo(const std::string &url) {
  initializeDecoder(url);
}

RNSkAndroidVideo::~RNSkAndroidVideo() {
  if (codec) {
    AMediaCodec_stop(codec);
    AMediaCodec_delete(codec);
  }
  if (extractor) {
    AMediaExtractor_delete(extractor);
  }
  fclose(fp);
}

void RNSkAndroidVideo::initializeDecoder(const std::string &url) {
  extractor = AMediaExtractor_new();
  fp = fopen(url.c_str(), "rb");
  if (fp == nullptr) {
    throw std::runtime_error("Failed to open video file");
  }
  AMediaExtractor *extractor = createExtractorFromFD(fp);
  if (extractor == nullptr) {
    // Now use extractor as needed
    // Remember to clean up resources after using them
    AMediaExtractor_delete(extractor);
    fclose(fp);
    throw std::runtime_error("Failed to create extractor from file descriptor");
  }
  size_t numTracks = AMediaExtractor_getTrackCount(extractor);
  if (numTracks == 0) {
    throw std::runtime_error("No tracks found in video file");
  }
  for (size_t i = 0; i < numTracks; ++i) {
    format = AMediaExtractor_getTrackFormat(extractor, i);
    const char *mime;
    if (AMediaFormat_getString(format, AMEDIAFORMAT_KEY_MIME, &mime)) {
      if (strncmp(mime, "video/", 6) == 0) {
        RNSkLogger::logToConsole("RNSkAndroidVideo Found video track %s", mime);
        videoTrackIndex = i;
        AMediaExtractor_selectTrack(extractor, videoTrackIndex);
        codec = AMediaCodec_createDecoderByType(mime);
        if (codec == nullptr) {
          throw std::runtime_error("Failed to create codec");
        }
        auto status = AMediaCodec_configure(codec, format, NULL, NULL, 0);
        if (status != AMEDIA_OK) {
          throw std::runtime_error("Failed to configure codec");
        }
        AMediaCodec_start(codec);
        break;
      }
    }
    // AMediaFormat_delete(format);
  }
  AMediaFormat_getInt32(format, AMEDIAFORMAT_KEY_WIDTH, &width);
  AMediaFormat_getInt32(format, AMEDIAFORMAT_KEY_HEIGHT, &height);
}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
  if (isExtractorAtEnd) {
    RNSkLogger::logToConsole("Extractor is at the end of the stream.");
    return nullptr;
  }
  AMediaCodecBufferInfo info;
  ssize_t bufIdx = AMediaCodec_dequeueInputBuffer(codec, 5000);
  RNSkLogger::logToConsole("Dequeued Input Buffer Index: %d", bufIdx);
  if (bufIdx < 0) {
    RNSkLogger::logToConsole("Failed to dequeue input buffer.");
    return nullptr;
  }
  size_t bufSize;
  uint8_t *buf = AMediaCodec_getInputBuffer(codec, bufIdx, &bufSize);
  if (!buf) {
    RNSkLogger::logToConsole("Failed to get input buffer.");
    return nullptr;
  }
  ssize_t size = AMediaExtractor_getSampleSize(extractor);
  if (size == -1) {
    throw std::runtime_error("Failed to get sample size.");
  }
  int64_t pts = AMediaExtractor_getSampleTime(extractor);
  if (size > bufSize) {
    std::runtime_error(
        "extractor sample size exceeds codec input buffer size"); //: %zu, %zd",
                                                                  //: bufSize,
                                                                  //: size);
  }
  ssize_t sampleSize = AMediaExtractor_readSampleData(extractor, buf, bufSize);
  RNSkLogger::logToConsole("Buffer Size: %zu, Sample Size: %zd", bufSize,
                           sampleSize);
  if (sampleSize < 0) {
    isExtractorAtEnd = true;
    AMediaCodec_queueInputBuffer(codec, bufIdx, 0, 0, 0,
                                 AMEDIACODEC_BUFFER_FLAG_END_OF_STREAM);
    RNSkLogger::logToConsole("No more samples to read. Marking end of stream.");
  } else {
    int64_t presentationTimeUs = AMediaExtractor_getSampleTime(extractor);
    AMediaCodec_queueInputBuffer(codec, bufIdx, 0, sampleSize,
                                 presentationTimeUs, 0);
    AMediaExtractor_advance(extractor);
  }

  bufIdx = AMediaCodec_dequeueOutputBuffer(codec, &info, 0);
  if (bufIdx >= 0) {
    if (timeStamp) {
      *timeStamp =
          info.presentationTimeUs / 1e6; // Convert microseconds to seconds
    }

    uint8_t *outputBuffer = AMediaCodec_getOutputBuffer(codec, bufIdx, NULL);
    sk_sp<SkData> data = SkData::MakeWithoutCopy(outputBuffer, height * 4);
    auto imageInfo = SkImageInfo::Make(width, height, kRGBA_8888_SkColorType,
                                       kUnpremul_SkAlphaType);
    sk_sp<SkImage> image = SkImages::RasterFromData(imageInfo, data, width * 4);
    AMediaCodec_releaseOutputBuffer(codec, bufIdx, false);
    return image;
  }

  return nullptr;
}

} // namespace RNSkia
