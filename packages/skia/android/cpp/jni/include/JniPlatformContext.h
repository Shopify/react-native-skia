#pragma once

#include <fbjni/fbjni.h>
#include <jsi/jsi.h>

#include <exception>
#include <functional>
#include <memory>
#include <mutex>
#include <queue>
#include <string>
#include <utility>

#include "RNSkPlatformContext.h"

class SkStreamAsset;
namespace RNSkia {

namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class JniPlatformContext : public jni::HybridClass<JniPlatformContext> {
public:
  static auto constexpr kJavaDescriptor =
      "Lcom/reactnative/skia/PlatformContext;";

  static jni::local_ref<jhybriddata>
  initHybrid(jni::alias_ref<jhybridobject> jThis, const float);

  static void registerNatives();

  void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStreamAsset>)> &op);

  void raiseError(const std::exception &err);

  void runTaskOnMainThread(std::function<void()> task);

  void notifyTaskReadyNative();

  /** Runs the task on the thread views present on (PresentThread.java). */
  void runTaskOnPresentThread(std::function<void()> task);

  void notifyPresentTaskReadyNative();

  float getPixelDensity() { return _pixelDensity; }

private:
  friend HybridBase;
  jni::global_ref<JniPlatformContext::javaobject> javaPart_;

  /** Tasks for one thread, run in order by one dispatch at a time. */
  class TaskQueue {
  public:
    /** Queues the task; returns whether a dispatch must be scheduled. */
    bool push(std::function<void()> task) {
      std::lock_guard<std::mutex> lock(_mutex);
      _tasks.push(std::move(task));
      return !std::exchange(_dispatchScheduled, true);
    }

    /** The dispatch: runs every task queued so far. */
    void run() {
      std::queue<std::function<void()>> tasks;
      {
        std::lock_guard<std::mutex> lock(_mutex);
        std::swap(tasks, _tasks);
        _dispatchScheduled = false;
      }
      while (!tasks.empty()) {
        auto task = std::move(tasks.front());
        tasks.pop();
        if (task) {
          task();
        }
      }
    }

  private:
    std::mutex _mutex;
    std::queue<std::function<void()>> _tasks;
    bool _dispatchScheduled = false;
  };

  float _pixelDensity;
  TaskQueue _mainThreadTasks;
  TaskQueue _presentThreadTasks;

  explicit JniPlatformContext(
      jni::alias_ref<JniPlatformContext::jhybridobject> jThis,
      const float pixelDensity)
      : javaPart_(jni::make_global(jThis)), _pixelDensity(pixelDensity) {}
};
} // namespace RNSkia
