package com.shopify.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.SurfaceTexture;
import android.view.Surface;
import android.view.TextureView;
import androidx.annotation.NonNull;

@SuppressLint("ViewConstructor")
public class WebGPUTextureView extends TextureView implements TextureView.SurfaceTextureListener {

  WebGPUViewAPI mApi;

  public WebGPUTextureView(Context context, WebGPUViewAPI api) {
    super(context);
    mApi = api;
    setOpaque(false);
    setSurfaceTextureListener(this);
  }

  @Override
  public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
    Surface surface = new Surface(surfaceTexture);
    mApi.surfaceCreated(surface);
  }

  @Override
  public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
    Surface surface = new Surface(surfaceTexture);
    mApi.surfaceChanged(surface);
  }

  @Override
  public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
    mApi.surfaceDestroyed();
    return true;
  }

  @Override
  public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surfaceTexture) {
    // No implementation needed
  }
}
