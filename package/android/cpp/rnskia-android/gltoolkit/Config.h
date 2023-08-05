#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "gltoolkit/Macros.h"

namespace RNSkia {

enum class API {
  kOpenGL,
  kOpenGLES2,
  kOpenGLES3,
};

enum class Samples {
  kZero = 0,
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
  kNonSpecified,
  kWindow,
  kPBuffer,
};

struct ConfigDescriptor {
  API api = API::kOpenGLES2;
  Samples samples = Samples::kZero;
  ColorFormat color_format = ColorFormat::kRGBA8888;
  StencilBits stencil_bits = StencilBits::kZero;
  DepthBits depth_bits = DepthBits::kZero;
  SurfaceType surface_type = SurfaceType::kNonSpecified;
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