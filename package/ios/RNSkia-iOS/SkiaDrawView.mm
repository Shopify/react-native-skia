
#import <SkiaDrawView.h>
#import <RNSkDrawViewImpl.h>

@implementation SkiaDrawView {
  RNSkDrawViewImpl* _impl;
}

-(void) dealloc {
  if(_impl != nullptr) {
    delete _impl;
    _impl = nullptr;
  }
}

- (instancetype)initWithContext: (RNSkia::PlatformContext*) context
{
  self = [super init];
  if (self) {
    
    self.device = MTLCreateSystemDefaultDevice();
    
    self.layer.opaque = false;
    self.layer.contentsScale = context->getPixelDensity();
    
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
    ((CAMetalLayer*)self.layer).pixelFormat = MTLPixelFormatBGRA8Unorm;
#pragma clang diagnostic pop
    
    
    self.device = MTLCreateSystemDefaultDevice();
    _impl = new RNSkDrawViewImpl((SkiaDrawView*)self, context);
  }
  return self;
}

+ (Class)layerClass
{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  return [CAMetalLayer class];
#pragma clang diagnostic pop
}

- (void) layoutSubviews {
  [super layoutSubviews];
  _impl->setSize(self.bounds.size.width, self.bounds.size.height);
}

- (RNSkDrawViewImpl*) impl {
  return _impl;
}

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
    _impl->updateTouchState(nextTouches);
  }
}

- (void) willMoveToWindow:(UIWindow *)newWindow {
  [super willMoveToWindow: newWindow];
  if (newWindow == nil) {
    _impl->remove();    
  }
}

@end
