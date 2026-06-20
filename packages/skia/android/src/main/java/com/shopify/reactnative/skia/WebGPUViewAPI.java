package com.shopify.reactnative.skia;

import android.view.Surface;

public interface WebGPUViewAPI {

  void surfaceCreated(Surface surface);

  void surfaceChanged(Surface surface);

  void surfaceDestroyed();

  void surfaceOffscreen();
}
