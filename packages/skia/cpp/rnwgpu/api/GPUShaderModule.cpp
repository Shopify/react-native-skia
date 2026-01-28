#include "GPUShaderModule.h"

#include <memory>
#include <utility>

#include "jsi2/JSIConverter.h"

namespace rnwgpu {

async::AsyncTaskHandle GPUShaderModule::getCompilationInfo() {
  auto module = _instance;

  return _async->postTask(
      [module](const async::AsyncTaskHandle::ResolveFunction &resolve,
               const async::AsyncTaskHandle::RejectFunction &reject) {
        auto result = std::make_shared<GPUCompilationInfo>();
        module.GetCompilationInfo(
            wgpu::CallbackMode::AllowProcessEvents,
            [result, resolve,
             reject](wgpu::CompilationInfoRequestStatus status,
                     const wgpu::CompilationInfo *compilationInfo) mutable {
              if (status != wgpu::CompilationInfoRequestStatus::Success ||
                  compilationInfo == nullptr) {
                reject("Failed to get compilation info");
                return;
              }

              result->_messages.reserve(compilationInfo->messageCount);
              for (size_t i = 0; i < compilationInfo->messageCount; ++i) {
                const auto &wgpuMessage = compilationInfo->messages[i];
                GPUCompilationMessageData message;
                message.message =
                    wgpuMessage.message.length ? wgpuMessage.message.data : "";
                message.type = wgpuMessage.type;
                message.lineNum = wgpuMessage.lineNum;
                message.linePos = wgpuMessage.linePos;
                message.offset = wgpuMessage.offset;
                message.length = wgpuMessage.length;
                result->_messages.push_back(std::move(message));
              }

              resolve([result =
                           std::move(result)](jsi::Runtime &runtime) mutable {
                return JSIConverter<std::shared_ptr<GPUCompilationInfo>>::toJSI(
                    runtime, result);
              });
            });
      });
}

} // namespace rnwgpu
