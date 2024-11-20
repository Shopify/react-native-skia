package com.shopify.reactnative.skia;

import android.view.Surface;

public interface SkiaViewAPI {
    void onSurfaceCreated(Surface surface, int width, int height);

    void onSurfaceChanged(int width, int height);

    void onSurfaceDestroyed();

}
