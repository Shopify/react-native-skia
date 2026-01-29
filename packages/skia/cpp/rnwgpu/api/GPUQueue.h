#pragma once

#include <memory>
#include <string>
#include <vector>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/async/AsyncRunner.h"
#include "rnwgpu/async/AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

#include "rnwgpu/ArrayBuffer.h"
#include "GPUBuffer.h"
#include "GPUCommandBuffer.h"
#include "GPUExtent3D.h"
#include "descriptors/GPUImageCopyExternalImage.h"
#include "descriptors/GPUImageCopyTexture.h"
#include "descriptors/GPUImageCopyTextureTagged.h"
#include "descriptors/GPUImageDataLayout.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUQueue : public NativeObject<GPUQueue> {
public:
  static constexpr const char *CLASS_NAME = "GPUQueue";

  explicit GPUQueue(wgpu::Queue instance,
                    std::shared_ptr<async::AsyncRunner> async,
                    std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _async(async),
        _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  void submit(std::vector<std::shared_ptr<GPUCommandBuffer>> commandBuffers);
  async::AsyncTaskHandle onSubmittedWorkDone();
  void writeBuffer(std::shared_ptr<GPUBuffer> buffer, uint64_t bufferOffset,
                   std::shared_ptr<ArrayBuffer> data,
                   std::optional<uint64_t> dataOffsetElements,
                   std::optional<size_t> sizeElements);
  void writeTexture(std::shared_ptr<GPUImageCopyTexture> destination,
                    std::shared_ptr<ArrayBuffer> data,
                    std::shared_ptr<GPUImageDataLayout> dataLayout,
                    std::shared_ptr<GPUExtent3D> size);
  void copyExternalImageToTexture(
      std::shared_ptr<GPUImageCopyExternalImage> source,
      std::shared_ptr<GPUImageCopyTextureTagged> destination,
      std::shared_ptr<GPUExtent3D> copySize);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUQueue::getBrand);
    installMethod(runtime, prototype, "submit", &GPUQueue::submit);
    installMethod(runtime, prototype, "onSubmittedWorkDone",
                  &GPUQueue::onSubmittedWorkDone);
    installMethod(runtime, prototype, "writeBuffer", &GPUQueue::writeBuffer);
    installMethod(runtime, prototype, "writeTexture", &GPUQueue::writeTexture);
    installMethod(runtime, prototype, "copyExternalImageToTexture",
                  &GPUQueue::copyExternalImageToTexture);
    installGetterSetter(runtime, prototype, "label", &GPUQueue::getLabel,
                        &GPUQueue::setLabel);
  }

  inline const wgpu::Queue get() { return _instance; }

private:
  wgpu::Queue _instance;
  std::shared_ptr<async::AsyncRunner> _async;
  std::string _label;
};

} // namespace rnwgpu
