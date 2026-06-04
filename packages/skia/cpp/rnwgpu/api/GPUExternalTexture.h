#pragma once

#include <memory>
#include <string>
#include <utility>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

struct GPUExternalTextureDescriptor;

class GPUExternalTexture : public NativeObject<GPUExternalTexture> {
public:
  static constexpr const char *CLASS_NAME = "GPUExternalTexture";

  // Import a native buffer (via descriptor.source, a CVPixelBufferRef /
  // AHardwareBuffer* from Skia's NativeBuffer API) as a GPUExternalTexture on
  // `device`: imports the native surface as SharedTextureMemory, begins access,
  // and wraps the resulting wgpu::ExternalTexture together with the resources
  // whose lifetime it owns. The matching EndAccess runs in destroy() / the
  // destructor. Defined in GPUExternalTexture.cpp.
  static std::shared_ptr<GPUExternalTexture>
  Create(wgpu::Device device,
         std::shared_ptr<GPUExternalTextureDescriptor> descriptor);

  // Construct from an already-built wgpu::ExternalTexture plus the underlying
  // shared-memory resources we need to keep alive. The wrapper takes ownership
  // of the SharedTextureMemory + Texture and calls EndAccess on destruction so
  // the producer (the native buffer's surface) can reclaim it.
  GPUExternalTexture(wgpu::ExternalTexture instance,
                     wgpu::SharedTextureMemory memory, wgpu::Texture texture,
                     std::string label)
      : NativeObject(CLASS_NAME), _instance(std::move(instance)),
        _memory(std::move(memory)), _texture(std::move(texture)),
        _label(std::move(label)) {}

  ~GPUExternalTexture() override { destroy(); }

public:
  std::string getBrand() { return CLASS_NAME; }

  // End the shared-memory access window and release the underlying resources.
  // Idempotent: safe to call more than once, and the destructor calls it as a
  // garbage-collection fallback. Call it right after the queue.submit() that
  // sampled this texture (never before): a GPUExternalTexture's access window
  // is owned by this wrapper's lifetime, not by submit, so without an explicit
  // destroy() the producer's surface stays claimed until GC runs. EndAccess is
  // the designed post-submit call: Dawn keeps the texture alive for in-flight
  // GPU work via the fences it returns.
  void destroy() {
    if (_memory && _texture) {
      wgpu::SharedTextureMemoryEndAccessState state{};
#if defined(__ANDROID__)
      // Dawn's Vulkan backend requires the released VkImageLayout to be chained
      // (matches BeginAccess in GPUExternalTexture::Create).
      wgpu::SharedTextureMemoryVkImageLayoutEndState vkEnd{};
      state.nextInChain = &vkEnd;
#endif
      (void)_memory.EndAccess(_texture, &state);
    }
    _texture = nullptr;
    _memory = nullptr;
  }

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUExternalTexture::getBrand);
    installGetterSetter(runtime, prototype, "label",
                        &GPUExternalTexture::getLabel,
                        &GPUExternalTexture::setLabel);
    installMethod(runtime, prototype, "destroy", &GPUExternalTexture::destroy);
  }

  inline const wgpu::ExternalTexture get() { return _instance; }

private:
  wgpu::ExternalTexture _instance;
  wgpu::SharedTextureMemory _memory;
  wgpu::Texture _texture;
  std::string _label;
};

} // namespace rnwgpu
