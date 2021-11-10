#include <DisplayLink.h>
#include <RNSkPlatformContext.h>
#include <SkStream.h>

namespace RNSkia {

class PlatformContext : public RNSkPlatformContext {
public:
  PlatformContext() : RNSkPlatformContext([[UIScreen mainScreen] scale]) {}

  ~PlatformContext() { endDrawLoop(); }

  void beginDrawLoop() override;
  void endDrawLoop() override;

  virtual void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStream>)> &op) override;

  void raiseError(const std::exception &err) override;

private:
  DisplayLink *_displayLink;
};

} // namespace RNSkia
