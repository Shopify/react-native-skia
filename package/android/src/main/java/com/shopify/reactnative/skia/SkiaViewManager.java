package com.shopify.reactnative.skia;

import androidx.annotation.NonNull;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

@ReactModule(name = SkiaViewManager.NAME)
public class SkiaViewManager extends SkiaViewManagerSpec<SkiaView> {

  public static final String NAME = "SkiaView";

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public SkiaView createViewInstance(ThemedReactContext context) {
    return new SkiaView(context);
  }

  @Override
  @ReactProp(name = "contextId")
  public void setContextId(SkiaView view, int value) {
    view.setContextId(value);
  }
}