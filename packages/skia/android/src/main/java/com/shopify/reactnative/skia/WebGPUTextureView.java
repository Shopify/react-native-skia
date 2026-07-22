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
  private Surface mSurface;

  public WebGPUTextureView(Context context, WebGPUViewAPI api) {
    super(context);
    mApi = api;
    setOpaque(false);
    setSurfaceTextureListener(this);
  }

  @Override
  public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
    mSurface = new Surface(surfaceTexture);
    mApi.surfaceCreated(mSurface);
  }

  @Override
  public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
    mApi.surfaceChanged(mSurface);
  }

  @Override
  public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
    // Detach first (synchronous through JNI) so the native side has dropped
    // its window reference before we release ours.
    mApi.surfaceOffscreen();
    if (mSurface != null) {
      mSurface.release();
      mSurface = null;
    }
    return true;
  }

  @Override
  public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surfaceTexture) {
    // No implementation needed
  }
}
