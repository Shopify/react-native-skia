#pragma once

#include <memory>

#include "jsi2/NativeObject.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class Canvas : public NativeObject<Canvas> {
public:
  static constexpr const char *CLASS_NAME = "Canvas";

  Canvas(void *nativeSurface, int width, int height)
      : NativeObject(CLASS_NAME), _nativeSurface(nativeSurface), _width(width),
        _height(height), _clientWidth(width), _clientHeight(height) {}

  void *getNativeSurface() { return _nativeSurface; }

  int getWidth() { return _width; }
  int getHeight() { return _height; }

  void setWidth(int width) { _width = width; }
  void setHeight(int height) { _height = height; }

  int getClientWidth() { return _clientWidth; }
  int getClientHeight() { return _clientHeight; }

  void setClientWidth(int width) { _clientWidth = width; }
  void setClientHeight(int height) { _clientHeight = height; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetterSetter(runtime, prototype, "width", &Canvas::getWidth,
                        &Canvas::setWidth);
    installGetterSetter(runtime, prototype, "height", &Canvas::getHeight,
                        &Canvas::setHeight);
    installGetter(runtime, prototype, "clientWidth", &Canvas::getClientWidth);
    installGetter(runtime, prototype, "clientHeight", &Canvas::getClientHeight);
  }

private:
  void *_nativeSurface;
  int _width;
  int _height;
  int _clientWidth;
  int _clientHeight;
};

} // namespace rnwgpu
