#ifdef RCT_NEW_ARCH_ENABLED

#import "SkiaWebGPUView.h"

#import <react/renderer/components/rnskia/ComponentDescriptors.h>
#import <react/renderer/components/rnskia/EventEmitters.h>
#import <react/renderer/components/rnskia/Props.h>
#import <react/renderer/components/rnskia/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "WebGPUMetalView.h"

using namespace facebook::react;

@implementation SkiaWebGPUView

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const SkiaWebGPUViewProps>();
    _props = defaultProps;
  }
  return self;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      SkiaWebGPUViewComponentDescriptor>();
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  /*
    It's important to destroy the Metal Layer before releasing a view
    to the recycled pool to prevent displaying outdated content from
    the last usage in the new context.
  */
  self.contentView = nil;
}

- (WebGPUMetalView *)getContentView {
  if (!self.contentView) {
    self.contentView = [WebGPUMetalView new];
  }
  return (WebGPUMetalView *)self.contentView;
}

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<const SkiaWebGPUViewProps>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<const SkiaWebGPUViewProps>(props);

  if (newViewProps.contextId != oldViewProps.contextId) {
    /*
      The context is set only once during mounting the component
      and never changes because it isn't available for users to modify.
    */
    WebGPUMetalView *metalView = [WebGPUMetalView new];
    self.contentView = metalView;
    [metalView setContextId:@(newViewProps.contextId)];
    [metalView configure];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics {
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
  [(WebGPUMetalView *)self.contentView update];
}

@end

Class<RCTComponentViewProtocol> SkiaWebGPUViewCls(void) {
  return SkiaWebGPUView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
