#pragma once

#include <RNSkJsView.h>
#include <JniSkiaBaseView.h>

namespace RNSkia
{
    JNI_DRAW_VIEW_IMPL(
      JniSkiaDrawView,
      "Lcom/shopify/reactnative/skia/SkiaDrawView;",
      RNSkia::RNSkJsView
    )
} // namespace RNSkia
