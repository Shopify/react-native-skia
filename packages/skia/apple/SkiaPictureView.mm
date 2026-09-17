#import "SkiaPictureView.h"

#import <QuartzCore/CATransaction.h>

#import "RNSkManager.h"
#import "RNSkMetalCanvasProvider.h"
#import "RNSkPlatformContext.h"
#import "RNSkiaModule.h"
#import "SkiaManager.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnskia/ComponentDescriptors.h>
#import <react/renderer/components/rnskia/EventEmitters.h>
#import <react/renderer/components/rnskia/Props.h>
#import <react/renderer/components/rnskia/RCTComponentViewHelpers.h>

using namespace facebook::react;

@implementation SkiaPictureView {
  std::shared_ptr<RNSkMetalCanvasProvider> _canvasProvider;
  std::shared_ptr<RNSkia::RNSkView> _view;
  RNSkia::RNSkManager *_manager;
  bool _debugMode;
  bool _opaque;
  bool _useP3ColorSpace;
  bool _highBitDepth;
  size_t _skiaNativeId;
}

#pragma mark Initialization and destruction

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    // Pass SkManager as a raw pointer to avoid circular dependencies
    _manager = [SkiaManager latestActiveSkManager].get();
    _skiaNativeId = 0;
    _debugMode = false;
    static const auto defaultProps =
        std::make_shared<const SkiaPictureViewProps>();
    _props = defaultProps;
  }
  return self;
}

- (void)createSkiaView {
  auto context = _manager->getPlatformContext();
  // The canvas provider requests redraws (size changes, app coming back to the
  // foreground) through the component view so it never outlives its target.
  __weak SkiaPictureView *weakSelf = self;
  _canvasProvider = std::make_shared<RNSkMetalCanvasProvider>(
      [weakSelf]() { [weakSelf requestRedraw]; }, context, true);
  _view = std::make_shared<RNSkia::RNSkView>(context, _canvasProvider);
}

- (void)requestRedraw {
  if (_view != nullptr) {
    _view->requestRedraw();
  }
}

#pragma mark Lifecycle

#if !TARGET_OS_OSX
- (void)willMoveToSuperview:(UIView *)newSuperView {
#else
- (void)viewWillMoveToSuperview:(NSView *)newSuperView {
#endif // !TARGET_OS_OSX
  if (newSuperView != nullptr) {
    // Create the Skia view when the parent view is set
    if (_view == nullptr && _manager != nullptr) {
      [self createSkiaView];
      [self.layer addSublayer:_canvasProvider->getLayer()];
      if (_skiaNativeId != 0) {
        _manager->setSkiaView(_skiaNativeId, _view);
      }
      _view->setShowDebugOverlays(_debugMode);
      _canvasProvider->setUseP3ColorSpace(_useP3ColorSpace);
      _canvasProvider->setHighBitDepth(_highBitDepth);
    }
  }
}

- (void)removeFromSuperview {
  // Cleanup when removed from view hierarchy
  if (_view != nullptr) {
    [_canvasProvider->getLayer() removeFromSuperlayer];

    if (_skiaNativeId != 0 && _manager != nullptr) {
      _manager->setSkiaView(_skiaNativeId, nullptr);
    }

    _view = nullptr;
    _canvasProvider = nullptr;
  }

  [super removeFromSuperview];
}

- (void)dealloc {
  [self unregisterView];
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  [self unregisterView];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask {
  [super finalizeUpdates:updateMask];
  if (updateMask == RNComponentViewUpdateMaskAll) {
    // this flag is only set when the view is inserted and we want to set the
    // manager here since the view could be recycled or the app could be
    // refreshed and we would have a stale manager then
    _manager = [SkiaManager latestActiveSkManager].get();
  }
}

- (void)unregisterView {
  if (_manager != nullptr && _skiaNativeId != 0) {
    _manager->unregisterSkiaView(_skiaNativeId);
  }
}

#pragma mark Render

- (void)drawRect:(CGRect)rect {
  // We override drawRect to ensure we to direct rendering when the
  // underlying OS view needs to render:
  if (_view != nullptr) {
    _view->redraw();
  }
}

#pragma mark Layout

- (void)layoutSubviews {
  [super layoutSubviews];
  if (_canvasProvider != nullptr) {
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    _canvasProvider->setSize(self.bounds.size.width, self.bounds.size.height);
    [CATransaction commit];
  }
}

#pragma mark Properties

- (void)setDebugMode:(bool)debugMode {
  _debugMode = debugMode;
  if (_view != nullptr) {
    _view->setShowDebugOverlays(debugMode);
  }
}

- (void)setOpaque:(bool)opaque {
  _opaque = opaque;
}

- (void)setSkiaNativeId:(size_t)nativeId {
  _skiaNativeId = nativeId;

  if (_view != nullptr) {
    _manager->registerSkiaView(nativeId, _view);
  }
}

- (void)setUseP3ColorSpace:(bool)useP3ColorSpace {
  _useP3ColorSpace = useP3ColorSpace;
  if (_canvasProvider != nullptr) {
    _canvasProvider->setUseP3ColorSpace(_useP3ColorSpace);
  }
}

- (void)setHighBitDepth:(bool)highBitDepth {
  _highBitDepth = highBitDepth;
  if (_canvasProvider != nullptr) {
    _canvasProvider->setHighBitDepth(_highBitDepth);
  }
}

#pragma mark External API

- (std::shared_ptr<RNSkia::RNSkView>)skiaView {
  return _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      SkiaPictureViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &newProps =
      *std::static_pointer_cast<const SkiaPictureViewProps>(props);
  [super updateProps:props oldProps:oldProps];
  // `nativeId` is the base RN view prop; Skia uses it as the key under which
  // the JS side addresses this view through the ViewApi.
  int nativeId = [RCTNSStringFromString(newProps.nativeId) intValue];
  [self setSkiaNativeId:nativeId];
  [self setDebugMode:newProps.debug];
  [self setOpaque:newProps.opaque];
  [self setHighBitDepth:newProps.highBitDepth];
  if (newProps.colorSpace == "" || newProps.colorSpace == "srgb") {
    [self setUseP3ColorSpace:false];
  } else if (newProps.colorSpace == "p3") {
    [self setUseP3ColorSpace:true];
  }
}

@end

Class<RCTComponentViewProtocol> SkiaPictureViewCls(void) {
  return SkiaPictureView.class;
}
