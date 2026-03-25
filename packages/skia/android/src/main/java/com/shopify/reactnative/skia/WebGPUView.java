package com.shopify.reactnative.skia;

import android.content.Context;
import android.view.Surface;
import android.view.View;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.views.view.ReactViewGroup;

public class WebGPUView extends ReactViewGroup implements WebGPUViewAPI {

  private int mContextId;
  private boolean mTransparent = false;
  private View mView = null;

  WebGPUView(Context context) {
    super(context);
  }

  public void setContextId(int contextId) {
    mContextId = contextId;
  }

  public void setTransparent(boolean value) {
    Context ctx = getContext();
    if (value != mTransparent || mView == null) {
      if (mView != null) {
        removeView(mView);
      }
      mTransparent = value;
      if (mTransparent) {
        mView = new WebGPUTextureView(ctx, this);
      } else {
        mView = new WebGPUSurfaceView(ctx, this);
      }
      addView(mView);
    }
  }

  @Override
  protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    super.onLayout(changed, left, top, right, bottom);
    if (mView != null) {
      mView.layout(0, 0, this.getMeasuredWidth(), this.getMeasuredHeight());
    }
  }

  @Override
  public void surfaceCreated(Surface surface) {
    float density = getResources().getDisplayMetrics().density;
    float width = getWidth() / density;
    float height = getHeight() / density;
    onSurfaceCreate(surface, mContextId, width, height);
  }

  @Override
  public void surfaceChanged(Surface surface) {
    float density = getResources().getDisplayMetrics().density;
    float width = getWidth() / density;
    float height = getHeight() / density;
    onSurfaceChanged(surface, mContextId, width, height);
  }

  @Override
  public void surfaceDestroyed() {
    onSurfaceDestroy(mContextId);
  }

  @Override
  public void surfaceOffscreen() {
    switchToOffscreenSurface(mContextId);
  }

  @DoNotStrip
  private native void onSurfaceCreate(
    Surface surface,
    int contextId,
    float width,
    float height
  );

  @DoNotStrip
  private native void onSurfaceChanged(
    Surface surface,
    int contextId,
    float width,
    float height
  );

  @DoNotStrip
  private native void onSurfaceDestroy(int contextId);

  @DoNotStrip
  private native void switchToOffscreenSurface(int contextId);
}
