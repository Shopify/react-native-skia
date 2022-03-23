#import <SkiaDrawView.h>
#import <RNSkDrawViewImpl.h>
#import <RNSkManager.h>

@implementation SkiaDrawView {
  std::shared_ptr<RNSkDrawViewImpl> _impl;
  RNSkia::RNSkManager* _manager;
  RNSkia::RNSkDrawingMode _drawingMode;
  bool _debugMode;
  size_t _nativeId;
}

#pragma mark Initialization and destruction

- (instancetype) initWithManager: (RNSkia::RNSkManager*)manager;
{
  self = [super init];
  if (self) {
    _manager = manager;
    _nativeId = 0;
    _debugMode = false;
    _drawingMode = RNSkia::RNSkDrawingMode::Default;
  }
  return self;
}

- (void)dealloc {
  if(_manager != nullptr) {
    _manager->unregisterSkiaDrawView(_nativeId);
  }
}

#pragma mark Lifecycle

- (void) willMoveToWindow:(UIWindow *)newWindow {
  [super willMoveToWindow: newWindow];
  
  if (newWindow == NULL) {
    // Remove implementation view when the parent view is not set
    if(_impl != nullptr) {
      if(_nativeId != 0) {
        _manager->setSkiaDrawView(_nativeId, nullptr);
      }
      _impl = nullptr;
    }
  } else {
    // Create implementation view when the parent view is set
    if(_impl == nullptr && _manager != nullptr) {
      __weak typeof(self) weakSelf = self;
      _impl = std::make_shared<RNSkDrawViewImpl>(weakSelf, _manager->getPlatformContext());
      if(_nativeId != 0) {
        _manager->setSkiaDrawView(_nativeId, _impl.get());
      }
      _impl->setDrawingMode(_drawingMode);
      _impl->setShowDebugOverlays(_debugMode);      
    }
  }
}

#pragma mark Layout

- (void) layoutSubviews {
  [super layoutSubviews];
  if(_impl != nullptr) {
    _impl->setSize(self.bounds.size.width, self.bounds.size.height);
  }
}

#pragma mark Properties

-(void) setDrawingMode:(std::string) mode {
  _drawingMode = mode.compare("continuous") == 0 ? RNSkia::RNSkDrawingMode::Continuous : RNSkia::RNSkDrawingMode::Default;
  
  if(_impl != nullptr) {
    _impl->setDrawingMode(_drawingMode);
  }
}

-(void) setDebugMode:(bool) debugMode {
  _debugMode = debugMode;
  if(_impl != nullptr) {
    _impl->setShowDebugOverlays(debugMode);
  }
}

- (void) setNativeId:(size_t) nativeId {
  _nativeId = nativeId;
  
  if(_impl != nullptr) {
    _manager->registerSkiaDrawView(nativeId, _impl.get());
  }
}

#pragma mark External API

- (std::shared_ptr<RNSkDrawViewImpl>) impl {
  return _impl;
}

#pragma mark Touch handling

- (void) touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
  [self handleTouches:touches withEvent:event];
}

-(void) touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
  [self handleTouches:touches withEvent:event];
}

-(void) touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
  [self handleTouches:touches withEvent:event];
}

- (void) handleTouches:(NSSet<UITouch*>*) touches withEvent:(UIEvent*) event {
  if (event.type == UIEventTypeTouches) {
    std::vector<RNSkia::RNSkTouchPoint> nextTouches;
    for (UITouch *touch in touches) {
      auto position = [touch preciseLocationInView:self];
      RNSkia::RNSkTouchPoint nextTouch;
      nextTouch.x = position.x;
      nextTouch.y = position.y;
      nextTouch.force = [touch force];
      auto phase = [touch phase];
      switch(phase) {
        case UITouchPhaseBegan:
          nextTouch.type = RNSkia::RNSkTouchType::Start;
          break;
        case UITouchPhaseMoved:
          nextTouch.type = RNSkia::RNSkTouchType::Active;
          break;
        case UITouchPhaseEnded:
          nextTouch.type = RNSkia::RNSkTouchType::End;
          break;
        case UITouchPhaseCancelled:
          nextTouch.type = RNSkia::RNSkTouchType::Cancelled;
          break;
        default:
          nextTouch.type = RNSkia::RNSkTouchType::Active;
          break;
      }
      
      nextTouches.push_back(nextTouch);
    }
    if(_impl != nullptr) {
      _impl->updateTouchState(nextTouches);
    }
  }
}

@end
