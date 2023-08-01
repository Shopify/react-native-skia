// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#pragma once

#include <EGL/egl.h>

#include <functional>

namespace RNSkia {

std::function<void *(const char *)> CreateProcAddressResolver();

#define LOG_EGL_ERROR LogEGLError(__FILE__, __LINE__);

void LogEGLError(const char *file, int line);

} // namespace RNSkia