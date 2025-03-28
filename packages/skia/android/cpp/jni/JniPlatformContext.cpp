#include "JniPlatformContext.h"

#include <exception>
#include <thread>
#include <utility>

#include "include/core/SkData.h"
#include "include/core/SkRefCnt.h"
#include "include/core/SkStream.h"
#include "include/core/SkTypes.h"

#include <android/bitmap.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkBitmap.h"
#include "include/core/SkPixmap.h"

#pragma clang diagnostic pop

static SkAlphaType alpha_type(int32_t flags) {
  switch ((flags >> ANDROID_BITMAP_FLAGS_ALPHA_SHIFT) &
          ANDROID_BITMAP_FLAGS_ALPHA_MASK) {
  case ANDROID_BITMAP_FLAGS_ALPHA_OPAQUE:
    return kOpaque_SkAlphaType;
  case ANDROID_BITMAP_FLAGS_ALPHA_PREMUL:
    return kPremul_SkAlphaType;
  case ANDROID_BITMAP_FLAGS_ALPHA_UNPREMUL:
    return kUnpremul_SkAlphaType;
  default:
    break;
  }

  return kUnknown_SkAlphaType;
}

static SkColorType color_type(int32_t format) {
  switch (format) {
  case ANDROID_BITMAP_FORMAT_RGBA_8888:
    return kRGBA_8888_SkColorType;
  case ANDROID_BITMAP_FORMAT_RGB_565:
    return kRGB_565_SkColorType;
  case ANDROID_BITMAP_FORMAT_RGBA_4444:
    return kARGB_4444_SkColorType;
  case ANDROID_BITMAP_FORMAT_RGBA_F16:
    return kRGBA_F16_SkColorType;
  case ANDROID_BITMAP_FORMAT_A_8:
    return kAlpha_8_SkColorType;
  default:
    break;
  }

  return kUnknown_SkColorType;
}

namespace RNSkia {

namespace jsi = facebook::jsi;

using TSelf = jni::local_ref<JniPlatformContext::jhybriddata>;

void JniPlatformContext::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", JniPlatformContext::initHybrid),
  });
}

TSelf JniPlatformContext::initHybrid(jni::alias_ref<jhybridobject> jThis,
                                     float pixelDensity) {
  return makeCxxInstance(jThis, pixelDensity);
}

jni::global_ref<jobject>
JniPlatformContext::createVideo(const std::string &url) {
  jni::Environment::ensureCurrentThreadIsAttached();

  jni::ThreadScope ts; // Manages JNI thread attachment/detachment

  // Get the JNI environment
  JNIEnv *env = facebook::jni::Environment::current();

  // Convert std::string to jstring
  jstring jUrl = env->NewStringUTF(url.c_str());

  static auto method =
      javaPart_->getClass()->getMethod<jobject(jstring)>("createVideo");

  // Call the method and receive a local reference to the video object
  auto videoObject = method(javaPart_.get(), jUrl);
  env->DeleteLocalRef(jUrl);

  // Clean up the jstring local reference
  auto result = jni::make_global(videoObject);
  return result;
}

sk_sp<SkImage> JniPlatformContext::takeScreenshotFromViewTag(size_t tag) {
  // Call the java method for creating a view screenshot as a bitmap:
  auto env = jni::Environment::current();
  static auto method = javaPart_->getClass()->getMethod<jobject(int)>(
      "takeScreenshotFromViewTag");

  auto bitmap = method(javaPart_.get(), tag).release();

  // Let's convert to a native bitmap and get some info about the bitmap
  AndroidBitmapInfo bmi;
  AndroidBitmap_getInfo(env, bitmap, &bmi);

  // Convert android bitmap info to a Skia bitmap info
  auto colorType = color_type(bmi.format);
  auto alphaType = alpha_type(bmi.flags);

  auto skInfo = SkImageInfo::Make(SkISize::Make(bmi.width, bmi.height),
                                  colorType, alphaType);

  // Lock pixels
  void *pixels;
  AndroidBitmap_lockPixels(env, bitmap, &pixels);

  // Create pixmap from pixels and make a copy of it so that
  // the SkImage owns its own pixels
  SkPixmap pm(skInfo, pixels, bmi.stride);
  auto skImage = SkImages::RasterFromPixmapCopy(pm);

  // Unlock pixels
  AndroidBitmap_unlockPixels(env, bitmap);

  // Return our newly created SkImage!
  return skImage;
}

void JniPlatformContext::performStreamOperation(
    const std::string &sourceUri,
    const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) {
  static auto method = javaPart_->getClass()->getMethod<jbyteArray(jstring)>(
      "getJniStreamFromSource");

  auto loader = [=]() -> void {
    jni::ThreadScope ts;
    jstring jstr =
        (*jni::Environment::current()).NewStringUTF(sourceUri.c_str());

    // Get the array with data from input stream from Java
    auto array = method(javaPart_.get(), jstr);

    if (array == nullptr) {
      printf("Calling getJniStreamFromSource failed\n");
      return;
    }

    // Allocate buffer for java byte array
    jsize num_bytes = jni::Environment::current()->GetArrayLength(array.get());
    char *buffer = reinterpret_cast<char *>(malloc(num_bytes + 1));

    if (!buffer) {
      printf("Buff Fail\n");
      return;
    }

    jbyte *elements =
        jni::Environment::current()->GetByteArrayElements(array.get(), nullptr);
    if (!elements) {
      printf("Element Fail\n");
      free(buffer);
      return;
    }

    // Copy data from java array to buffer
    memcpy(buffer, elements, num_bytes);
    buffer[num_bytes] = 0;

    jni::Environment::current()->ReleaseByteArrayElements(array.get(), elements,
                                                          JNI_ABORT);

    // Copy malloced data and give ownership to SkData
    auto data = SkData::MakeFromMalloc(buffer, num_bytes);
    auto skStream = SkMemoryStream::Make(data);

    // Perform operation
    op(std::move(skStream));
  };

  // Fire and forget the thread - will be resolved on completion
  std::thread(loader).detach();
}

void JniPlatformContext::raiseError(const std::exception &err) {
  jni::ThreadScope ts;
  static auto method =
      javaPart_->getClass()->getMethod<void(std::string)>("raise");
  method(javaPart_.get(), std::string(err.what()));
}

} // namespace RNSkia
