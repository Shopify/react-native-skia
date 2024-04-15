#pragma once

#include <memory>
#include <string>

#include <jni.h>
#include <jsi/jsi.h>
#include <fbjni/fbjni.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkAndroidVideo.h"

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

RNSkAndroidVideo::RNSkAndroidVideo(const std::string &url)
    : _url(std::move(url)) {
    jni::ThreadScope ts;  // Manage thread attachment and detachment automatically
    auto env = jni::Environment::current();  // Get the current JNI environment

    // Get the RNSkVideo class
    jclass videoClass = env->FindClass("com/shopify/reactnative/skia/RNSkVideo");
    if (!videoClass) {
        env->ExceptionDescribe();  // Optional: Log the exception if class is not found
        return;
    }

    // Get the constructor of RNSkVideo that takes a String URL
    jmethodID constructor = env->GetMethodID(videoClass, "<init>", "(Ljava/lang/String;)V");
    if (!constructor) {
        env->ExceptionDescribe();  // Optional: Log the exception if constructor is not found
        return;
    }

    // Convert C++ string to Java string
    jstring jVideoUrl = env->NewStringUTF(url.c_str());

    // Create new instance of RNSkVideo
    jobject videoObject = env->NewObject(videoClass, constructor, jVideoUrl);
}

RNSkAndroidVideo::~RNSkAndroidVideo() {}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
  return nullptr;
}

} // namespace RNSkia

