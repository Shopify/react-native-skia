package com.shopify.reactnative.skia;

import android.view.Surface;

/**
 * Surface lifecycle events a WebGPU child view reports. The registry entry
 * itself is owned by the JS Canvas component (created lazily, removed via
 * RNWebGPU.destroyContext on unmount); views only attach and detach surfaces.
 * A detached context keeps rendering into an offscreen texture whose content
 * is blitted onto the next attached surface.
 */
public interface WebGPUViewAPI {

  void surfaceCreated(Surface surface);

  void surfaceChanged(Surface surface);

  void surfaceOffscreen();
}
