package com.shopify.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import androidx.annotation.NonNull;

@SuppressLint("ViewConstructor")
public class WebGPUSurfaceView extends SurfaceView implements SurfaceHolder.Callback {

  WebGPUViewAPI mApi;

  public WebGPUSurfaceView(Context context, WebGPUViewAPI api) {
    super(context);
    mApi = api;
    getHolder().addCallback(this);
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    mApi.surfaceDestroyed();
  }

  @Override
  public void surfaceCreated(@NonNull SurfaceHolder holder) {
    mApi.surfaceCreated(holder.getSurface());
  }

  @Override
  public void surfaceChanged(@NonNull SurfaceHolder holder, int format, int width, int height) {
    mApi.surfaceChanged(holder.getSurface());
  }

  @Override
  public void surfaceDestroyed(@NonNull SurfaceHolder holder) {
    mApi.surfaceOffscreen();
  }
}
