#import "SkiaGraphiteView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTLog.h>

#import <react/renderer/components/rnskia/ComponentDescriptors.h>
#import <react/renderer/components/rnskia/EventEmitters.h>
#import <react/renderer/components/rnskia/Props.h>
#import <react/renderer/components/rnskia/RCTComponentViewHelpers.h>

using namespace facebook::react;

#if defined(SK_GRAPHITE)

#import <QuartzCore/CADisplayLink.h>

#import "RNSkAppleView.h"
#import "RNSkGraphiteView.h"
#import "RNSkPlatformContext.h"
#import "SkiaManager.h"

@implementation SkiaGraphiteView {
#if !TARGET_OS_OSX
  CADisplayLink *_displayLink;
#endif
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    // Pass SkManager as a raw pointer to avoid circular dependencies
    auto skManager = [SkiaManager latestActiveSkManager].get();
    [self initCommon:skManager
             factory:[](std::shared_ptr<RNSkia::RNSkPlatformContext> context) {
               return std::make_shared<RNSkAppleView<RNSkia::RNSkGraphiteView>>(
                   context);
             }];
    static const auto defaultProps =
        std::make_shared<const SkiaGraphiteViewProps>();
    _props = defaultProps;
  }
  return self;
}

- (std::shared_ptr<RNSkia::RNSkGraphiteView>)graphiteView {
  auto impl = [self impl];
  if (impl == nullptr) {
    return nullptr;
  }
  return std::static_pointer_cast<RNSkia::RNSkGraphiteView>(
      impl->getDrawView());
}

#pragma mark - Frames

// Presents on the display link: armed when a recording is submitted, paused
// again once the queue is empty. macOS has no CADisplayLink on the minimum
// deployment target, so frames are presented as soon as the main thread gets
// to them there.
- (void)scheduleFrame {
#if !TARGET_OS_OSX
  if (_displayLink == nil) {
    _displayLink = [CADisplayLink displayLinkWithTarget:self
                                               selector:@selector(onFrame:)];
    [_displayLink addToRunLoop:[NSRunLoop mainRunLoop]
                       forMode:NSRunLoopCommonModes];
  }
  _displayLink.paused = NO;
#else
  auto view = [self graphiteView];
  if (view) {
    view->presentFrame();
  }
#endif
}

#if !TARGET_OS_OSX
- (void)onFrame:(CADisplayLink *)link {
  auto view = [self graphiteView];
  if (view == nullptr || !view->presentFrame()) {
    link.paused = YES;
  }
}

- (void)stopDisplayLink {
  [_displayLink invalidate];
  _displayLink = nil;
}
#endif

#pragma mark - Lifecycle

#if !TARGET_OS_OSX
- (void)willMoveToSuperview:(UIView *)newSuperView {
  [super willMoveToSuperview:newSuperView];
#else
- (void)viewWillMoveToSuperview:(NSView *)newSuperView {
  [super viewWillMoveToSuperview:newSuperView];
#endif // !TARGET_OS_OSX
  if (newSuperView != nullptr) {
    if (auto view = [self graphiteView]) {
      __weak SkiaGraphiteView *weakSelf = self;
      view->setFrameScheduler([weakSelf]() { [weakSelf scheduleFrame]; });
    }
  }
}

- (void)removeFromSuperview {
#if !TARGET_OS_OSX
  [self stopDisplayLink];
#endif
  [super removeFromSuperview];
}

- (void)prepareForRecycle {
#if !TARGET_OS_OSX
  [self stopDisplayLink];
#endif
  [super prepareForRecycle];
}

- (void)dealloc {
#if !TARGET_OS_OSX
  [self stopDisplayLink];
#endif
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      SkiaGraphiteViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &newProps =
      *std::static_pointer_cast<const SkiaGraphiteViewProps>(props);
  [super updateProps:props oldProps:oldProps];
  int nativeId =
      [[RCTConvert NSString:RCTNSStringFromString(newProps.nativeId)] intValue];
  [self setNativeId:nativeId];
  [self setDebugMode:newProps.debug];
  [self setOpaque:newProps.opaque];
  [self setHighBitDepth:newProps.highBitDepth];
}

@end

#else // SK_GRAPHITE

@implementation SkiaGraphiteView

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static dispatch_once_t once;
    dispatch_once(&once, ^{
      RCTLogError(@"SkiaGraphiteView requires the Graphite backend. Rebuild "
                  @"with SK_GRAPHITE enabled; the view renders nothing.");
    });
    static const auto defaultProps =
        std::make_shared<const SkiaGraphiteViewProps>();
    _props = defaultProps;
  }
  return self;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      SkiaGraphiteViewComponentDescriptor>();
}

@end

#endif // SK_GRAPHITE

Class<RCTComponentViewProtocol> SkiaGraphiteViewCls(void) {
  return SkiaGraphiteView.class;
}
