#pragma once

#include <memory>

#include <jsi/jsi.h>

#include "Commands.h"
#include "Drawings.h"

namespace RNSkia {

class Convertor {
public:
  static std::unique_ptr<CommandBase> convert(jsi::Runtime &runtime,
                                              const jsi::Object &object) {
    try {
      auto type = static_cast<CommandType>(
          object.getProperty(runtime, "type").asNumber());
      materializedProps(runtime, object);
      return convert(runtime, object, type);
    } catch (const std::exception &) {
      return nullptr;
    }
  }

private:
  static void materializedProps(jsi::Runtime &runtime,
                                const jsi::Object &object) {
    if (object.hasProperty(runtime, "animatedProps")) {
      auto animatedProps =
          object.getProperty(runtime, "animatedProps").asObject(runtime);
      auto props = object.getProperty(runtime, "props").asObject(runtime);
      auto propNames = animatedProps.getPropertyNames(runtime);
      auto length = propNames.length(runtime);

      for (size_t i = 0; i < length; i++) {
        auto propName = propNames.getValueAtIndex(runtime, i)
                            .asString(runtime)
                            .utf8(runtime);
        auto propValue = animatedProps.getProperty(runtime, propName.c_str())
                             .asObject(runtime)
                             .getProperty(runtime, "value");
        props.setProperty(runtime, propName.c_str(), propValue);
      }
    }
  }

  static std::unique_ptr<CommandBase>
  convert(jsi::Runtime &runtime, const jsi::Object &object, CommandType type) {
    try {
      switch (type) {
      case CommandType::Group:
        return convert<CommandType::Group>(runtime, object);
      case CommandType::SaveCTM:
        return SaveCTMCommand::fromJSIObject(runtime, object);
      case CommandType::SavePaint:
        return SavePaintCommand::fromJSIObject(runtime, object);
      case CommandType::DrawCircle:
        return DrawCircleCommand::fromJSIObject(runtime, object);
      case CommandType::DrawText:
        return DrawTextCommand::fromJSIObject(runtime, object);
      default:
        return std::make_unique<Command<CommandType::Group>>(type);
      }
    } catch (const std::exception &) {
      return nullptr;
    }
  }

  template <CommandType T>
  static std::unique_ptr<CommandBase> convert(jsi::Runtime &runtime,
                                              const jsi::Object &object);

  // Template specializations
  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::Group>(jsi::Runtime &runtime,
                              const jsi::Object &object) {
    auto command = std::make_unique<GroupCommand>();
    auto children = object.getProperty(runtime, "children")
                        .asObject(runtime)
                        .asArray(runtime);

    for (size_t i = 0; i < children.size(runtime); i++) {
      std::unique_ptr<CommandBase> childCommand = Convertor::convert(
          runtime, children.getValueAtIndex(runtime, i).asObject(runtime));
      //          if (!childCommand) {
      //              throw std::runtime_error("Failed to convert child command
      //              of type");
      //          }
      command->children.push_back(std::move(childCommand));
    }
    return command;
  }

  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::SavePaint>(jsi::Runtime &runtime,
                                  const jsi::Object &object) {
    auto command = std::make_unique<SavePaintCommand>();
    return command;
  }
};
} // namespace RNSkia
