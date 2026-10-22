#include "JniPlatformContext.h"

#include <exception>
#include <thread>
#include <utility>

#include "include/core/SkData.h"
#include "include/core/SkRefCnt.h"
#include "include/core/SkStream.h"
#include "include/core/SkTypes.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

using TSelf = jni::local_ref<JniPlatformContext::jhybriddata>;

void JniPlatformContext::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", JniPlatformContext::initHybrid),
      makeNativeMethod("notifyTaskReadyNative",
                       JniPlatformContext::notifyTaskReadyNative),
      makeNativeMethod("notifyPresentTaskReadyNative",
                       JniPlatformContext::notifyPresentTaskReadyNative),
  });
}

TSelf JniPlatformContext::initHybrid(jni::alias_ref<jhybridobject> jThis,
                                     float pixelDensity) {
  return makeCxxInstance(jThis, pixelDensity);
}

void JniPlatformContext::performStreamOperation(
    const std::string &sourceUri,
    const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) {
  static auto method = javaPart_->getClass()->getMethod<jbyteArray(jstring)>(
      "getJniStreamFromSource");

  auto loader = [=, this]() -> void {
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

void JniPlatformContext::runTaskOnMainThread(std::function<void()> task) {
  if (!_mainThreadTasks.push(std::move(task))) {
    return;
  }
  jni::ThreadScope ts;
  static auto method =
      javaPart_->getClass()->getMethod<void()>("notifyTaskReady");
  method(javaPart_.get());
}

void JniPlatformContext::notifyTaskReadyNative() { _mainThreadTasks.run(); }

void JniPlatformContext::runTaskOnPresentThread(std::function<void()> task) {
  if (!_presentThreadTasks.push(std::move(task))) {
    return;
  }
  jni::ThreadScope ts;
  static auto method =
      javaPart_->getClass()->getMethod<void()>("notifyPresentTaskReady");
  method(javaPart_.get());
}

void JniPlatformContext::notifyPresentTaskReadyNative() {
  _presentThreadTasks.run();
}

void JniPlatformContext::raiseError(const std::exception &err) {
  jni::ThreadScope ts;
  static auto method =
      javaPart_->getClass()->getMethod<void(std::string)>("raise");
  method(javaPart_.get(), std::string(err.what()));
}

} // namespace RNSkia
