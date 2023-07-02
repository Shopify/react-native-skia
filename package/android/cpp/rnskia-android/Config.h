// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "Macros.h"

namespace RNSkia {

enum class API {
  kOpenGL,
  kOpenGLES2,
  kOpenGLES3,
};

enum class Samples {
  kOne = 1,
  kTwo = 2,
  kFour = 4,
};

enum class ColorFormat {
  kRGBA8888,
  kRGB565,
};

enum class StencilBits {
  kZero = 0,
  kEight = 8,
};

enum class DepthBits {
  kZero = 0,
  kEight = 8,
};

enum class SurfaceType {
  kWindow,
  kPBuffer,
};

struct ConfigDescriptor {
  API api = API::kOpenGLES2;
  Samples samples = Samples::kOne;
  ColorFormat color_format = ColorFormat::kRGB565;
  StencilBits stencil_bits = StencilBits::kZero;
  DepthBits depth_bits = DepthBits::kZero;
  SurfaceType surface_type = SurfaceType::kPBuffer;
};

class Config {
public:
  Config(ConfigDescriptor descriptor, EGLConfig config);

  ~Config();

  bool IsValid() const;

  const ConfigDescriptor &GetDescriptor() const;

  const EGLConfig &GetHandle() const;

private:
  const ConfigDescriptor desc_;
  EGLConfig config_ = nullptr;

  DISALLOW_COPY_AND_ASSIGN(Config);
};

} // namespace RNSkia