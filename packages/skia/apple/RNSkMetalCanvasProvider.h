#pragma once

#import <atomic>

#import "RNSkPlatformContext.h"
#import "RNSkView.h"

#import <MetalKit/MetalKit.h>
#import <QuartzCore/CAMetalLayer.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import <include/gpu/ganesh/GrDirectContext.h>

#pragma clang diagnostic pop

class RNSkMetalCanvasProvider : public RNSkia::RNSkCanvasProvider {
public:
  RNSkMetalCanvasProvider(std::function<void()> requestRedraw,
                          std::shared_ptr<RNSkia::RNSkPlatformContext> context,
                          bool useP3ColorSpace = true);

  ~RNSkMetalCanvasProvider();

  int getWidth() override;
  int getHeight() override;

  bool renderToCanvas(const std::function<void(SkCanvas *)> &cb) override;

  void setSize(int width, int height);
  void setUseP3ColorSpace(bool useP3ColorSpace);
  void setHighBitDepth(bool highBitDepth);
  CALayer *getLayer();

private:
  std::shared_ptr<RNSkia::RNSkPlatformContext> _context;
  // _ctx is created/destroyed on the main thread (setSize via
  // layoutSubviews) and must only be dereferenced there; getWidth/getHeight
  // are called from the JS thread and read the cached dimensions instead.
  std::unique_ptr<RNSkia::WindowContext> _ctx = nullptr;
  std::atomic<int> _width = -1;
  std::atomic<int> _height = -1;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  CAMetalLayer *_layer;
#pragma clang diagnostic pop
  bool _useP3ColorSpace = true;
  bool _highBitDepth = false;
};
