#include <memory>
#include <string>

#if __ANDROID_API__ >= 26
#include <android/hardware_buffer_jni.h>
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
  // TODO: Delete the global reference
  //env->DeleteGlobalRef(_jniVideo);
}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
    JNIEnv *env = facebook::jni::Environment::current();
    // Get the Java class and method ID
    jclass cls = env->GetObjectClass(_jniVideo.get());
    jmethodID mid = env->GetMethodID(cls, "nextImage", "()Landroid/hardware/HardwareBuffer;");
    if (mid == nullptr) {
        // Method not found, handle error
        RNSkLogger::logToConsole("nextImage method not found");
        return nullptr;
    }
    // Call the Java method
    jobject jHardwareBuffer = env->CallObjectMethod(_jniVideo.get(), mid);
    if (jHardwareBuffer == nullptr) {
        RNSkLogger::logToConsole("Buffer not found");
        // Null return, handle error
        return nullptr;
    }
    // Convert jobject to AHardwareBuffer
    AHardwareBuffer* buffer = AHardwareBuffer_fromHardwareBuffer(env, jHardwareBuffer);
    return SkiaOpenGLSurfaceFactory::makeImageFromHardwareBuffer(buffer);
}

double RNSkAndroidVideo::duration() {
    JNIEnv *env = facebook::jni::Environment::current();
    jclass cls = env->GetObjectClass(_jniVideo.get());
    jmethodID mid = env->GetMethodID(cls, "getDuration", "()D");
    if (!mid) {
        RNSkLogger::logToConsole("getDuration method not found");
        return 0.0;
    }
    return env->CallDoubleMethod(_jniVideo.get(), mid);
}
double RNSkAndroidVideo::framerate() {
    JNIEnv *env = facebook::jni::Environment::current();
    jclass cls = env->GetObjectClass(_jniVideo.get());
    jmethodID mid = env->GetMethodID(cls, "getFrameRate", "()D");
    if (!mid) {
        RNSkLogger::logToConsole("getFrameRate method not found");
        return 0.0;
    }
    return env->CallDoubleMethod(_jniVideo.get(), mid);
}

void RNSkAndroidVideo::seek(double timestamp) {
    JNIEnv *env = facebook::jni::Environment::current();
    jclass cls = env->GetObjectClass(_jniVideo.get());
    jmethodID mid = env->GetMethodID(cls, "seek", "(J)V");
    if (!mid) {
        RNSkLogger::logToConsole("seek method not found");
        return;
    }
    env->CallVoidMethod(_jniVideo.get(), mid, static_cast<jlong>(timestamp));
}

} // namespace RNSkia

