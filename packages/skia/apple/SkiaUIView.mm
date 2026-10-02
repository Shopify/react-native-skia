#import <QuartzCore/CATransaction.h>

#import "RNSkiaModule.h"
#import "SkiaUIView.h"

#include <utility>
#include <vector>

#import "RNSkManager.h"
#import "RNSkPictureView.h"
#import "SkiaPictureView.h"
#if !defined(SK_GRAPHITE)
#import "MetalContext.h"
#endif

@implementation SkiaUIView {
  std::shared_ptr<RNSkBaseAppleView> _impl;
  RNSkia::RNSkManager *_manager;
  std::function<std::shared_ptr<RNSkBaseAppleView>(
      std::shared_ptr<RNSkia::RNSkPlatformContext>)>
      _factory;
  bool _debugMode;
  bool _opaque;
  bool _useP3ColorSpace;
  bool _highBitDepth;
  size_t _nativeId;
}

#pragma mark Initialization and destruction

- (void)initCommon:(RNSkia::RNSkManager *)manager
           factory:(std::function<std::shared_ptr<RNSkBaseAppleView>(
                        std::shared_ptr<RNSkia::RNSkPlatformContext>)>)factory {
  _manager = manager;
  _nativeId = 0;
  _debugMode = false;
  _factory = factory;
}

#pragma mark Lifecycle

#if !TARGET_OS_OSX
- (void)willMoveToSuperview:(UIView *)newSuperView {
#else
- (void)viewWillMoveToSuperview:(NSView *)newSuperView {
#endif // !TARGET_OS_OSX
  if (newSuperView != nullptr) {
    // Create implementation view when the parent view is set
    if (_impl == nullptr && _manager != nullptr) {
      _impl = _factory(_manager->getPlatformContext());
      if (_impl == nullptr) {
        throw std::runtime_error(
            "Expected Skia view implementation, got nullptr.");
      }
      [self.layer addSublayer:_impl->getLayer()];
      if (_nativeId != 0) {
        _manager->setSkiaView(_nativeId, _impl->getDrawView());
      }
      _impl->getDrawView()->setShowDebugOverlays(_debugMode);
      _impl->setUseP3ColorSpace(_useP3ColorSpace);
      _impl->setHighBitDepth(_highBitDepth);
    }
  }
}

- (void)removeFromSuperview {
  // Cleanup when removed from view hierarchy
  if (_impl != nullptr) {
    if (_nativeId != 0 && _manager != nullptr) {
      _manager->setSkiaView(_nativeId, nullptr);
    }

    [self releaseDrawView];
  }

  [super removeFromSuperview];
}

- (void)dealloc {
  [self unregisterView];
  [self releaseDrawView];
}

- (void)prepareForRecycle {
  // Recycling keeps the UIView alive. Release its native scene and Metal layer
  // now, even if UIKit did not call this view's removeFromSuperview override.
  [self unregisterView];
  [self releaseDrawView];
  [super prepareForRecycle];
}

#pragma mark - Native resource lifetime
- (void)releaseDrawView {
  if (_impl == nullptr) {
    return;
  }
  // A queued mapper/snapshot may still hold the draw view. Clear its scene
  // explicitly instead of waiting for the last shared_ptr or a runtime GC.
  if ([self isKindOfClass:[SkiaPictureView class]]) {
    auto renderer = std::static_pointer_cast<RNSkia::RNSkPictureRenderer>(
        _impl->getDrawView()->getRenderer());
    renderer->clear();
  }
  [_impl->getLayer() removeFromSuperlayer];
  _impl = nullptr;
#if !defined(SK_GRAPHITE)
  MetalContext::RequestMainThreadCleanup();
#endif
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask {
  [super finalizeUpdates:updateMask];
  if (updateMask == RNComponentViewUpdateMaskAll) {
    // this flag is only set when the view is inserted and we want to set the
    // manager here since the view could be recycled or the app could be
    // refreshed and we would have a stale manager then
    _manager = [RNSkiaModule latestActiveSkManager].get();
  }
}

- (void)unregisterView {
  if (_manager != nullptr && _nativeId != 0) {
    _manager->unregisterSkiaView(_nativeId);
  }
  _nativeId = 0;
}

#pragma Render

- (void)drawRect:(CGRect)rect {
  // We override drawRect to ensure we to direct rendering when the
  // underlying OS view needs to render:
  if (_impl != nullptr) {
    _impl->getDrawView()->redraw();
  }
}

#pragma mark Layout

- (void)layoutSubviews {
  [super layoutSubviews];
  if (_impl != nullptr) {
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    _impl->setSize(self.bounds.size.width, self.bounds.size.height);
    [CATransaction commit];
  }
}

#pragma mark Properties

- (void)setDebugMode:(bool)debugMode {
  _debugMode = debugMode;
  if (_impl != nullptr) {
    _impl->getDrawView()->setShowDebugOverlays(debugMode);
  }
}

- (void)setOpaque:(bool)opaque {
  _opaque = opaque;
}

- (void)setNativeId:(size_t)nativeId {
  _nativeId = nativeId;

  if (_impl != nullptr) {
    _manager->registerSkiaView(nativeId, _impl->getDrawView());
  }
}

- (void)setUseP3ColorSpace:(bool)useP3ColorSpace {
  _useP3ColorSpace = useP3ColorSpace;
  if (_impl != nullptr) {
    _impl->setUseP3ColorSpace(_useP3ColorSpace);
  }
}

- (void)setHighBitDepth:(bool)highBitDepth {
  _highBitDepth = highBitDepth;
  if (_impl != nullptr) {
    _impl->setHighBitDepth(_highBitDepth);
  }
}

#pragma mark External API

- (std::shared_ptr<RNSkBaseAppleView>)impl {
  return _impl;
}

@end
