#pragma once

#include <functional>
#include <memory>
#include <mutex>
#include <queue>
#include <thread>

// Define this to disable thread-safe deletion (for testing purposes)
// #define DISABLE_THREAD_SAFE_DELETION

namespace RNSkia {

/**
 * Utility class for managing thread-safe deletion of Skia objects.
 * Ensures objects are deleted on the thread that created them.
 */
template <typename T> class ThreadSafeDeletion {
private:
  struct DeletionItem {
    sk_sp<T> object;
    std::thread::id creationThreadId;
  };

  static inline std::mutex _queueMutex;
  static inline std::queue<DeletionItem> _deletionQueue;

  std::thread::id _creationThreadId;

public:
  ThreadSafeDeletion() : _creationThreadId(std::this_thread::get_id()) {}

  /**
   * Handles deletion of the object. If we're on the wrong thread,
   * queues it for later deletion. Otherwise, allows immediate deletion.
   * The object is always considered handled after this call.
   */
  void handleDeletion(sk_sp<T> object) {
    if (!object) {
      return;
    }

    // Check if we're on the creation thread
    if (std::this_thread::get_id() != _creationThreadId) {
      // Queue for deletion on the correct thread
      std::lock_guard<std::mutex> lock(_queueMutex);
      _deletionQueue.push({object, _creationThreadId});
    }
  }

  /**
   * Drains the deletion queue for objects created on the current thread.
   * Should be called periodically (e.g., when creating new objects).
   */
  static void drainDeletionQueue() {
    auto currentThreadId = std::this_thread::get_id();
    std::queue<DeletionItem> remainingItems;

    std::lock_guard<std::mutex> lock(_queueMutex);

    // Process all items in the queue
    while (!_deletionQueue.empty()) {
      auto item = _deletionQueue.front();
      _deletionQueue.pop();

      // If this item belongs to the current thread, let it be deleted
      if (item.creationThreadId == currentThreadId) {
        // The sk_sp destructor will handle the cleanup
        // Just let it go out of scope
      } else {
        // Keep items that belong to other threads
        remainingItems.push(item);
      }
    }

    // Put back items that couldn't be deleted
    _deletionQueue = std::move(remainingItems);
  }

  /**
   * Returns the number of items waiting for deletion.
   * Useful for debugging and testing.
   */
  static size_t getPendingDeletionCount() {
    std::lock_guard<std::mutex> lock(_queueMutex);
    return _deletionQueue.size();
  }
};

} // namespace RNSkia
