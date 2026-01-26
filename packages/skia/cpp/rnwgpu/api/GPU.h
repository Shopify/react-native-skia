#pragma once

#include <memory>
#include <string>
#include <unordered_set>
#include <variant>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/async/AsyncRunner.h"
#include "rnwgpu/async/AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUAdapter.h"
#include "descriptors/GPURequestAdapterOptions.h"

#include <webgpu/webgpu.h>

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPU : public NativeObject<GPU> {
public:
  static constexpr const char *CLASS_NAME = "GPU";

  explicit GPU(jsi::Runtime &runtime);

public:
  std::string getBrand() { return CLASS_NAME; }

  async::AsyncTaskHandle requestAdapter(
      std::optional<std::shared_ptr<GPURequestAdapterOptions>> options);
  wgpu::TextureFormat getPreferredCanvasFormat();

  std::unordered_set<std::string> getWgslLanguageFeatures();

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPU::getBrand);
    installMethod(runtime, prototype, "requestAdapter", &GPU::requestAdapter);
    installMethod(runtime, prototype, "getPreferredCanvasFormat",
                  &GPU::getPreferredCanvasFormat);
    installGetter(runtime, prototype, "wgslLanguageFeatures",
                  &GPU::getWgslLanguageFeatures);
  }

  inline const wgpu::Instance get() { return _instance; }

private:
  wgpu::Instance _instance;
  std::shared_ptr<async::AsyncRunner> _async;
};

} // namespace rnwgpu
