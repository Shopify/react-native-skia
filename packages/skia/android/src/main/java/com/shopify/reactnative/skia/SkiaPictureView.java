package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.SurfaceTexture;
import android.view.Surface;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

public class SkiaPictureView extends SkiaBaseView {
    @DoNotStrip
    private HybridData mHybridData;
    private final Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG);

    private boolean coldStart = false;
    private boolean textureViewReady = false;
    private Bitmap warmupBitmap = null;

    public SkiaPictureView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

    public void setColdStart(boolean coldStart) {
        this.coldStart = coldStart;
        if (coldStart) {
            releaseWarmupBitmap();
        }
        updateWillNotDraw();
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {
        textureViewReady = true;
        releaseWarmupBitmap();
        updateWillNotDraw();
        super.onSurfaceCreated(surface, width, height);
    }

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        textureViewReady = false;
        updateWillNotDraw();
        super.onSurfaceTextureCreated(surface, width, height);
    }

    @Override
    public void onSurfaceDestroyed() {
        textureViewReady = false;
        releaseWarmupBitmap();
        updateWillNotDraw();
        super.onSurfaceDestroyed();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        if (coldStart) {
            return; // Warmup disabled explicitly
        }

        final boolean shouldDrawWarmup = !textureViewReady || warmupBitmap != null;
        if (!shouldDrawWarmup) {
            return;
        }

        // Get the view dimensions
        int width = getWidth();
        int height = getHeight();

        if (width > 0 && height > 0) {
            if (!textureViewReady) {
                // Get the bitmap data from native
                int[] pixels = getBitmap(width, height);

                if (pixels != null && pixels.length == width * height) {
                    // Prepare or update the warmup bitmap
                    if (warmupBitmap == null || warmupBitmap.getWidth() != width || warmupBitmap.getHeight() != height) {
                        releaseWarmupBitmap();
                        warmupBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                    }
                    warmupBitmap.setPixels(pixels, 0, width, 0, 0, width, height);
                }
            }

            if (warmupBitmap != null) {
                canvas.drawBitmap(warmupBitmap, 0, 0, paint);
            }
        }

        if (textureViewReady) {
            releaseWarmupBitmap();
            updateWillNotDraw();
        }
    }

    @Override
    protected void surfaceTextureUpdated(SurfaceTexture surface) {
        if (textureViewReady) {
            return;
        }
        textureViewReady = true;
        if (warmupBitmap != null) {
            postInvalidateOnAnimation();
        } else {
            updateWillNotDraw();
        }
    }

    private native HybridData initHybrid(SkiaManager skiaManager);

    protected native void surfaceAvailable(Object surface, int width, int height, boolean opaque);

    protected native void surfaceSizeChanged(Object surface, int width, int height, boolean opaque);

    protected native void surfaceDestroyed();

    protected native void setBgColor(int color);

    protected native void setDebugMode(boolean show);

    protected native void registerView(int nativeId);

    protected native void unregisterView();

    protected native int[] getBitmap(int width, int height);

    private void releaseWarmupBitmap() {
        if (warmupBitmap != null && !warmupBitmap.isRecycled()) {
            warmupBitmap.recycle();
        }
        warmupBitmap = null;
    }

    private void updateWillNotDraw() {
        boolean skipDraw = coldStart || textureViewReady;
        setWillNotDraw(skipDraw);
        if (!skipDraw) {
            invalidate();
        }
    }
}
