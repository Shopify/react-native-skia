#include <condition_variable>
#include <cstdint>
#include <cstdio>
#include <functional>
#include <mutex>
#include <queue>
#include <string>
#include <thread>
#include <vector>

// https://github.com/embeddedartistry/embedded-resources/blob/master/examples/cpp/dispatch.cpp
namespace RNSkia {

class RNSKDispatchQueue {
  typedef std::function<void(void)> fp_t;

public:
  RNSKDispatchQueue(std::string name, size_t thread_cnt = 1);

  ~RNSKDispatchQueue();

  // dispatch and copy
  void dispatch(const fp_t &op);

  // dispatch and move
  void dispatch(fp_t &&op);

  // Deleted operations
  RNSKDispatchQueue(const RNSKDispatchQueue &rhs) = delete;

  RNSKDispatchQueue &operator=(const RNSKDispatchQueue &rhs) = delete;

  RNSKDispatchQueue(RNSKDispatchQueue &&rhs) = delete;

  RNSKDispatchQueue &operator=(RNSKDispatchQueue &&rhs) = delete;

private:
  std::string name_;
  std::mutex lock_;
  std::vector<std::thread> threads_;
  std::queue<fp_t> q_;
  std::condition_variable cv_;
  bool quit_ = false;

  void dispatch_thread_handler(void);
};
} // namespace RNSkia
