package com.shopify.reactnative.skia;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;
import com.facebook.react.viewmanagers.SkiaWebGPUViewManagerDelegate;
import com.facebook.react.viewmanagers.SkiaWebGPUViewManagerInterface;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

@ReactModule(name = WebGPUViewManager.NAME)
public class WebGPUViewManager extends ReactViewManager implements SkiaWebGPUViewManagerInterface<WebGPUView> {

  public static final String NAME = "SkiaWebGPUView";

  protected SkiaWebGPUViewManagerDelegate mDelegate;

  public WebGPUViewManager() {
    mDelegate = new SkiaWebGPUViewManagerDelegate(this);
  }

  protected SkiaWebGPUViewManagerDelegate getDelegate() {
    return mDelegate;
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  public WebGPUView createViewInstance(@NonNull ThemedReactContext context) {
    return new WebGPUView(context);
  }

  @Override
  @ReactProp(name = "transparent")
  public void setTransparent(WebGPUView view, boolean value) {
    view.setTransparent(value);
  }

  @Override
  @ReactProp(name = "contextId")
  public void setContextId(WebGPUView view, int value) {
    view.setContextId(value);
  }

  @Override
  public void onDropViewInstance(@NonNull ReactViewGroup view) {
    super.onDropViewInstance(view);
    ((WebGPUView) view).surfaceDestroyed();
  }
}
