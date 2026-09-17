package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.View;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.views.view.ReactViewGroup;

/**
 * The Android view backing <SkiaPictureView />. It hosts a SkiaTextureView
 * (or a SkiaSurfaceView when opaque) and forwards its surface lifecycle to the
 * native JniSkiaPictureView, which owns the RNSkView drawing the picture.
 */
public class SkiaPictureView extends ReactViewGroup implements SkiaViewAPI {
    @DoNotStrip
    private HybridData mHybridData;
    private final Paint paint = new Paint();

    private View mView;

    private boolean mHighBitDepth = false;
    private boolean androidWarmup = false;

    private final boolean debug = false;
    private final String tag = "SkiaView";

    public SkiaPictureView(Context context) {
        super(context);
        mView = new SkiaTextureView(context, this, debug);
        addView(mView);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // When pointerEvents is "none" or "box-none", make this view completely
        // transparent to touch dispatch so events pass through to views behind it
        if (!PointerEvents.canBeTouchTarget(getPointerEvents())) {
            return false;
        }
        return super.dispatchTouchEvent(ev);
    }

    public void setOpaque(boolean value) {
        if (value && mView instanceof SkiaTextureView) {
            recreateView(true);
        } else if (!value && mView instanceof SkiaSurfaceView) {
            recreateView(false);
        }
    }

    public void setHighBitDepth(boolean value) {
        if (mHighBitDepth == value) {
            return;
        }
        mHighBitDepth = value;
        // The flag only affects the opaque SurfaceView path (see
        // highBitDepthIfOpaque), so only that surface needs to be recreated
        // with the new buffer format.
        if (mView instanceof SkiaSurfaceView) {
            recreateView(true);
        }
    }

    public void setAndroidWarmup(boolean androidWarmup) {
        this.androidWarmup = androidWarmup;
        setWillNotDraw(!androidWarmup);
    }

    private void recreateView(boolean useSurfaceView) {
        removeView(mView);
        mView = useSurfaceView
                ? new SkiaSurfaceView(getContext(), this, debug)
                : new SkiaTextureView(getContext(), this, debug);
        addView(mView);
        // React Native sizes native children explicitly through onLayout, so
        // the requestLayout triggered by addView is ignored; size the new
        // child ourselves or it stays 0x0 and never gets a surface.
        if (getWidth() > 0 || getHeight() > 0) {
            mView.layout(0, 0, getWidth(), getHeight());
        }
    }

    private boolean highBitDepthIfOpaque(boolean opaque) {
        if (mHighBitDepth && !opaque) {
            // The 10-bit buffer format only has 2 bits of alpha, which would
            // visibly break translucency; the extra precision would also be
            // lost in the 8-bit composition pass.
            Log.w(tag, "highBitDepth requires the opaque prop on Android, falling back to the 8-bit format");
            return false;
        }
        return mHighBitDepth;
    }

    void dropInstance() {
        if (!RNSkiaModule.isModuleValid()) {
            return;
        }
        unregisterView();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        mView.layout(0, 0, right - left, bottom - top);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        // Skip the warming up feature if it is disabled or already cleared.
        if (!androidWarmup) {
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
            }
        }
    }

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {
        surfaceAvailable(surface, width, height, true, mHighBitDepth);
    }

    @Override
    public void onSurfaceChanged(Surface surface, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged " + width + "/" + height);
        surfaceSizeChanged(surface, width, height, true, mHighBitDepth);
    }

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        surfaceAvailable(surface, width, height, false, highBitDepthIfOpaque(false));
    }

    @Override
    public void onSurfaceTextureChanged(SurfaceTexture surface, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged " + width + "/" + height);
        surfaceSizeChanged(surface, width, height, false, highBitDepthIfOpaque(false));
    }

    @Override
    public void onSurfaceDestroyed() {
        surfaceDestroyed();
    }

    private native HybridData initHybrid(SkiaManager skiaManager);

    private native void surfaceAvailable(Object surface, int width, int height, boolean opaque, boolean highBitDepth);

    private native void surfaceSizeChanged(Object surface, int width, int height, boolean opaque, boolean highBitDepth);

    private native void surfaceDestroyed();

    native void setDebugMode(boolean show);

    native void registerView(int nativeId);

    private native void unregisterView();

    private native int[] getBitmap(int width, int height);
}
