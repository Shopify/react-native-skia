package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.SurfaceTexture;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.view.Surface;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

public class SkiaPictureView extends SkiaBaseView {
    @DoNotStrip
    private HybridData mHybridData;
    private Paint paint = new Paint();
    private final Paint clearPaint = new Paint();

    private boolean coldStart = false;
    private boolean surfaceReady = false;
    private boolean warmupFrameDrawn = false;
    private boolean needsWarmupClear = false;

    public SkiaPictureView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
        clearPaint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.CLEAR));
        updateWarmupState();
    }

    public void setColdStart(boolean coldStart) {
        this.coldStart = coldStart;
        if (coldStart && warmupFrameDrawn) {
            needsWarmupClear = true;
        }
        updateWarmupState();
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        if (needsWarmupClear) {
            clearWarmup(canvas);
            warmupFrameDrawn = false;
            needsWarmupClear = false;
            updateWarmupState();
            return;
        }

        if (!shouldRenderWarmupBitmap()) {
            return;
        }
        // Get the view dimensions
        int width = getWidth();
        int height = getHeight();

        if (width > 0 && height > 0) {
            // Get the bitmap data from native
            int[] pixels = getBitmap(width, height);

            if (pixels != null && pixels.length == width * height) {
                // Create bitmap from pixels
                Bitmap bitmap = Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888);

                // Draw the bitmap on the canvas
                paint.setFilterBitmap(true);
                canvas.drawBitmap(bitmap, 0, 0, paint);
                // Let GC release the bitmap; recycling immediately breaks hardware-accelerated draws.
                warmupFrameDrawn = true;
            }
        }
    }

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {
        markSurfaceReady();
        super.onSurfaceCreated(surface, width, height);
    }

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        markSurfaceReady();
        super.onSurfaceTextureCreated(surface, width, height);
    }

    @Override
    public void onSurfaceDestroyed() {
        handleSurfaceLoss();
        super.onSurfaceDestroyed();
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

    private void markSurfaceReady() {
        surfaceReady = true;
        if (warmupFrameDrawn) {
            needsWarmupClear = true;
        }
        updateWarmupState();
    }

    private void handleSurfaceLoss() {
        surfaceReady = false;
        warmupFrameDrawn = false;
        needsWarmupClear = false;
        updateWarmupState();
    }

    private boolean shouldRenderWarmupBitmap() {
        return !coldStart && !surfaceReady;
    }

    private void updateWarmupState() {
        boolean shouldDraw = shouldRenderWarmupBitmap() || needsWarmupClear;
        setWillNotDraw(!shouldDraw);
        if (shouldDraw) {
            postInvalidateOnAnimation();
        }
    }

    private void clearWarmup(Canvas canvas) {
        int width = getWidth();
        int height = getHeight();
        if (width <= 0 || height <= 0) {
            return;
        }
        canvas.drawRect(0, 0, width, height, clearPaint);
    }
}
