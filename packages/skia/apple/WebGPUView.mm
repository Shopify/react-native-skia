#ifdef RCT_NEW_ARCH_ENABLED

#import "WebGPUView.h"

#import <react/renderer/components/rnskia/ComponentDescriptors.h>
#import <react/renderer/components/rnskia/EventEmitters.h>
#import <react/renderer/components/rnskia/Props.h>
#import <react/renderer/components/rnskia/RCTComponentViewHelpers.h>

#import "WebGPUMetalView.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@implementation WebGPUView

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const WebGPUViewProps>();
    _props = defaultProps;
  }
  return self;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<WebGPUViewComponentDescriptor>();
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
      *std::static_pointer_cast<const WebGPUViewProps>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<const WebGPUViewProps>(props);

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

Class<RCTComponentViewProtocol> WebGPUViewCls(void) { return WebGPUView.class; }

#endif // RCT_NEW_ARCH_ENABLED
