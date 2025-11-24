package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.SurfaceTexture;
import android.view.View;

import androidx.core.view.ViewCompat;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

public class SkiaPictureView extends SkiaBaseView {

    @DoNotStrip
    private HybridData mHybridData;
    private final Paint paint = new Paint();

    private boolean coldStart = false;
    private boolean warmupActive = true;

    public SkiaPictureView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
        updateWillNotDraw();
        updateRenderViewAlpha();
    }

    public void setColdStart(boolean coldStart) {
        this.coldStart = coldStart;
        warmupActive = !coldStart && warmupActive;
        updateWillNotDraw();
        updateRenderViewAlpha();
        if (!coldStart && warmupActive) {
            ViewCompat.postInvalidateOnAnimation(this);
        }
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        if (coldStart || !warmupActive) {
            return;
        }

        int width = getWidth();
        int height = getHeight();

        if (width > 0 && height > 0) {
            int[] pixels = getBitmap(width, height);

            if (pixels != null && pixels.length == width * height) {
                Bitmap bitmap = Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888);
                paint.setFilterBitmap(true);
                canvas.drawBitmap(bitmap, 0, 0, paint);
            }
        }
    }

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        enableWarmupIfNeeded();
        super.onSurfaceTextureCreated(surface, width, height);
    }

    @Override
    public void onFirstFrameRendered() {
        disableWarmup();
    }

    private void disableWarmup() {
        if (coldStart || !warmupActive) {
            return;
        }
        warmupActive = false;
        updateWillNotDraw();
        updateRenderViewAlpha();
        ViewCompat.postInvalidateOnAnimation(this);
    }

    private void enableWarmupIfNeeded() {
        if (coldStart) {
            return;
        }
        warmupActive = true;
        updateWillNotDraw();
        updateRenderViewAlpha();
        ViewCompat.postInvalidateOnAnimation(this);
    }

    private void updateWillNotDraw() {
        setWillNotDraw(coldStart || !warmupActive);
    }

    @Override
    protected void onRenderViewCreated(View view) {
        super.onRenderViewCreated(view);
        updateRenderViewAlpha(view);
    }

    private void updateRenderViewAlpha() {
        View renderView = getRenderView();
        if (renderView != null) {
            updateRenderViewAlpha(renderView);
        }
    }

    private void updateRenderViewAlpha(View view) {
        float alpha = (!coldStart && warmupActive) ? 0f : 1f;
        if (view.getAlpha() != alpha) {
            view.setAlpha(alpha);
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
}
