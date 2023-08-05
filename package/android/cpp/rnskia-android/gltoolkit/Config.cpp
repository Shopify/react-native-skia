// Based on https://github.com/flutter/engine/tree/main/impeller/toolkit/egl
#include "Config.h"

#include <utility>

namespace RNSkia {

Config::Config(ConfigDescriptor descriptor, EGLConfig config)
    : desc_(descriptor), config_(config) {}

Config::~Config() = default;

const ConfigDescriptor &Config::GetDescriptor() const { return desc_; }

const EGLConfig &Config::GetHandle() const { return config_; }

bool Config::IsValid() const { return config_ != nullptr; }

} // namespace RNSkia