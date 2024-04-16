#include <memory>
#include <string>

#if __ANDROID_API__ >= 26
#include <android/hardware_buffer.h>
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkAndroidVideo.h"
#include "SkiaOpenGLSurfaceFactory.h"

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

RNSkAndroidVideo::RNSkAndroidVideo(jni::global_ref<jobject> jniVideo)
    : _jniVideo(jniVideo) {

}

RNSkAndroidVideo::~RNSkAndroidVideo() {
  JNIEnv *env = facebook::jni::Environment::current();
  //env->DeleteGlobalRef(_jniVideo);
}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
    JNIEnv *env = facebook::jni::Environment::current();

    // Get the Java class and method ID
    jclass cls = env->GetObjectClass(_jniVideo.get());
    jmethodID mid = env->GetMethodID(cls, "nextImage", "()Landroid/hardware/HardwareBuffer;");
    if (mid == nullptr) {
        // Method not found, handle error
        return nullptr;
    }

    // Call the Java method
    jobject jHardwareBuffer = env->CallObjectMethod(_jniVideo.get(), mid);
    if (jHardwareBuffer == nullptr) {
        // Null return, handle error
        return nullptr;
    }

    // Convert jobject to AHardwareBuffer
    AHardwareBuffer* buffer = AHardwareBuffer_fromHardwareBuffer(env, jHardwareBuffer);
    return SkiaOpenGLSurfaceFactory::makeImageFromHardwareBuffer(buffer);
}

} // namespace RNSkia

