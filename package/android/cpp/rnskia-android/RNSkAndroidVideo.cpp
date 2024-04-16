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
  // DO we need this a property
  if (format){
    AMediaFormat_delete(format);
  }
  if (codec) {
    AMediaCodec_stop(codec);
    AMediaCodec_delete(codec);
  }
  if (extractor) {
    AMediaExtractor_delete(extractor);
  }
}

void RNSkAndroidVideo::initializeDecoder(const std::string &url) {
  extractor = AMediaExtractor_new();
  auto fp = fopen(url.c_str(), "rb");
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
  fclose(fp);
  size_t numTracks = AMediaExtractor_getTrackCount(extractor);
  if (numTracks == 0) {
    throw std::runtime_error("No tracks found in video file");
  }
  for (size_t i = 0; i < numTracks; ++i) {
    format = AMediaExtractor_getTrackFormat(extractor, i);
    const char *formatStr = AMediaFormat_toString(format);
    RNSkLogger::logToConsole("Track %zu format: %s", i, formatStr);
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
  }
  AMediaFormat_getInt32(format, AMEDIAFORMAT_KEY_WIDTH, &width);
  AMediaFormat_getInt32(format, AMEDIAFORMAT_KEY_HEIGHT, &height);
}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
  if (!AMediaExtractor_advance(extractor)) {
    RNSkLogger::logToConsole("Failed to advance the media extractor.");
    return nullptr;
}
  size_t bufferSize;
  auto bufferIndex = AMediaCodec_dequeueInputBuffer(codec, 3 * 10000); // 2000
  if (bufferIndex < 0) {
      RNSkLogger::logToConsole("Failed to dequeue input buffer, status: %zd", bufferIndex);
      throw std::runtime_error("Couldn't dequeue input buffer");
  }
  auto inputBuffer = AMediaCodec_getInputBuffer(codec, bufferIndex, &bufferSize);
  if (inputBuffer == nullptr) {
      RNSkLogger::logToConsole("Failed to get input buffer for index: %zd", bufferIndex);
      return nullptr;
  }
  RNSkLogger::logToConsole("Dequeued input buffer index: %zd with size: %zu", bufferIndex, bufferSize);
  size_t sampleSize = AMediaExtractor_readSampleData(extractor, inputBuffer, 0);
  if (sampleSize == (size_t)-1) {
      RNSkLogger::logToConsole("No more data available in extractor or read failed");
      return nullptr;
  }
  auto presentationTimeUs = AMediaExtractor_getSampleTime(extractor);
  RNSkLogger::logToConsole("Read sample data size: %zu, PTS: %lld us", sampleSize, presentationTimeUs);
  
  size_t bufIndex;
  media_status_t queueStatus =AMediaCodec_queueInputBuffer(codec, bufIndex, 0, sampleSize, presentationTimeUs, 0);
  if (queueStatus != AMEDIA_OK) {
      RNSkLogger::logToConsole("Failed to queue input buffer, status: %d", queueStatus);
      return nullptr;
  }

  AMediaCodecBufferInfo info;
  int bufIdx = AMediaCodec_dequeueOutputBuffer(codec, &info, 0);

  if (bufIdx >= 0) {
    size_t bufSize;
    uint8_t *outputBuffer =
        AMediaCodec_getOutputBuffer(codec, bufIdx, &bufSize);

    sk_sp<SkData> data = SkData::MakeWithoutCopy(outputBuffer, height * 4);
    auto imageInfo = SkImageInfo::Make(width, height, kRGBA_8888_SkColorType,
                                       kUnpremul_SkAlphaType);
    sk_sp<SkImage> image = SkImages::RasterFromData(imageInfo, data, width * 4);

    if (timeStamp) {
      *timeStamp = (double)info.presentationTimeUs / 1e6;
      AMediaCodec_releaseOutputBuffer(codec, bufIdx, false);
    }

    AMediaCodec_releaseOutputBuffer(codec, bufIdx, false);
    return image;
  } else if (bufIdx == AMEDIACODEC_INFO_TRY_AGAIN_LATER) {
      RNSkLogger::logToConsole("try again later please");
  }
  return nullptr;
}

} // namespace RNSkia
