#pragma once

#import "RNSkiOSPlatformContext.h"
#import "RNSkJsView.h"
#import "RNSkMetalCanvasProvider.h"

class RNSkiOSJsView: public RNSkia::RNSkJsView {
public:
  RNSkiOSJsView(std::shared_ptr<RNSkia::RNSkPlatformContext> context):
    RNSkia::RNSkJsView(context,
                       std::make_shared<RNSkMetalCanvasProvider>(std::bind(&RNSkia::RNSkView::requestRedraw, this), context)) {
    
  }
  
  ~RNSkiOSJsView() {}
  
  CALayer* getLayer() {
    return std::static_pointer_cast<RNSkMetalCanvasProvider>(getCanvasProvider())->getLayer();
  }
  
  void setSize(int width, int height) {
    std::static_pointer_cast<RNSkMetalCanvasProvider>(getCanvasProvider())->setSize(width, height);
  }

};
