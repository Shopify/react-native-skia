// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "Config.h"

#include <utility>

namespace RNSkia {

Config::Config(ConfigDescriptor descriptor, EGLConfig config)
    : desc_(descriptor), config_(config) {}

Config::~Config() = default;

const ConfigDescriptor& Config::GetDescriptor() const {
  return desc_;
}

const EGLConfig& Config::GetHandle() const {
  return config_;
}

bool Config::IsValid() const {
  return config_ != nullptr;
}

}