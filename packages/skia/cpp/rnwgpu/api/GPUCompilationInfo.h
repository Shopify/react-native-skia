#pragma once

#include <string>
#include <vector>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

struct GPUCompilationMessageData {
  std::string message;
  wgpu::CompilationMessageType type;
  uint64_t lineNum;
  uint64_t linePos;
  uint64_t offset;
  uint64_t length;
};

class GPUCompilationInfo : public NativeObject<GPUCompilationInfo> {
public:
  static constexpr const char *CLASS_NAME = "GPUCompilationInfo";

  GPUCompilationInfo() : NativeObject(CLASS_NAME) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::vector<GPUCompilationMessageData> getMessages() { return _messages; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUCompilationInfo::getBrand);
    installGetter(runtime, prototype, "messages",
                  &GPUCompilationInfo::getMessages);
  }

private:
  std::vector<GPUCompilationMessageData> _messages;
  friend class GPUShaderModule;
};

template <> struct JSIConverter<std::vector<GPUCompilationMessageData>> {
  static std::vector<GPUCompilationMessageData>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    throw std::runtime_error("Invalid GPUCompilationMessageData::fromJSI()");
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::vector<GPUCompilationMessageData> arg) {
    jsi::Array result = jsi::Array(runtime, arg.size());
    for (size_t i = 0; i < arg.size(); i++) {
      const auto &message = arg[i];
      jsi::Object messageObj(runtime);
      messageObj.setProperty(
          runtime, "message",
          jsi::String::createFromUtf8(runtime, message.message));
      std::string typeStr;
      EnumMapper::convertEnumToJSUnion(message.type, &typeStr);
      messageObj.setProperty(runtime, "type",
                             jsi::String::createFromUtf8(runtime, typeStr));
      messageObj.setProperty(runtime, "lineNum",
                             static_cast<double>(message.lineNum));
      messageObj.setProperty(runtime, "linePos",
                             static_cast<double>(message.linePos));
      messageObj.setProperty(runtime, "offset",
                             static_cast<double>(message.offset));
      messageObj.setProperty(runtime, "length",
                             static_cast<double>(message.length));
      result.setValueAtIndex(runtime, i, messageObj);
    }
    return result;
  }
};

} // namespace rnwgpu
