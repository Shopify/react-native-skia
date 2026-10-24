#include "JniSkiaPresentedImages.h"

#include <android/bitmap.h>

namespace RNSkia {

LockedBitmap JniSkiaPresentedImages::makeBitmap(const SkImageInfo &info) {
  jni::ThreadScope threadScope;
  static const auto method =
      javaClassStatic()->getStaticMethod<JBitmap::javaobject(jint, jint)>(
          "makeBitmap");
  auto bitmap = method(javaClassStatic(), info.width(), info.height());
  // The pixels are written straight into the bitmap's memory, in rows of its
  // own stride.
  auto *env = jni::Environment::current();
  AndroidBitmapInfo bitmapInfo;
  void *address = nullptr;
  if (AndroidBitmap_getInfo(env, bitmap.get(), &bitmapInfo) !=
          ANDROID_BITMAP_RESULT_SUCCESS ||
      AndroidBitmap_lockPixels(env, bitmap.get(), &address) !=
          ANDROID_BITMAP_RESULT_SUCCESS) {
    return {};
  }
  return {jni::make_global(bitmap), SkPixmap(info, address, bitmapInfo.stride)};
}

void JniSkiaPresentedImages::unlockBitmap(
    jni::alias_ref<JBitmap::javaobject> bitmap, bool written) {
  jni::ThreadScope threadScope;
  AndroidBitmap_unlockPixels(jni::Environment::current(), bitmap.get());
  if (written) {
    // Uploads the texture ahead of the first draw: the views pick their levels
    // only once the bitmap's size is published (see PresentedImage).
    static const auto prepareToDraw =
        JBitmap::javaClassStatic()->getMethod<void()>("prepareToDraw");
    prepareToDraw(bitmap);
  }
}

void JniSkiaPresentedImages::publish(
    uint32_t id, jni::alias_ref<JBitmap::javaobject> bitmap) {
  jni::ThreadScope threadScope;
  static const auto method =
      javaClassStatic()
          ->getStaticMethod<void(jlong, jni::alias_ref<JBitmap::javaobject>)>(
              "publish");
  method(javaClassStatic(), static_cast<jlong>(id), bitmap);
}

void JniSkiaPresentedImages::discard(uint32_t id) {
  jni::ThreadScope threadScope;
  static const auto method =
      javaClassStatic()->getStaticMethod<void(jlong)>("discard");
  method(javaClassStatic(), static_cast<jlong>(id));
}

} // namespace RNSkia
