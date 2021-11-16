package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.Surface;
import android.view.TextureView;
import android.view.MotionEvent;
import androidx.core.view.MotionEventCompat;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

public class SkiaDrawView extends TextureView implements TextureView.SurfaceTextureListener {

    private static final String TAG = "Java::JniSkiaDrawView";

    @DoNotStrip
    private HybridData mHybridData;

    public SkiaDrawView(Context ctx) {
        super(ctx);
        RNSkiaModule skiaModule = ((ReactContext)ctx).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager().getPlatformContext());
        setSurfaceTextureListener(this);
        setOpaque(false);
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        int action = ev.getAction();
        // Up is the final event when the last touch point is released
        if(action == MotionEvent.ACTION_UP) {
            // Then we should just pass an empty array because there are
            // no more touches left
            updateTouchPoints(new double[0]);
        } else {
            // Otherwise pass the touches
            int count = ev.getPointerCount();
            MotionEvent.PointerCoords r = new MotionEvent.PointerCoords();
            double[] points = new double[count*2];
            for (int i = 0; i < count; i++) {
                ev.getPointerCoords(i, r);
                points[i] = r.x;
                points[i+1] = r.y;
            }
            updateTouchPoints(points);
        }
        return true;
    }

    @Override
    public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
        Log.v(TAG, "onSurfaceTextureAvailable " + width + ", " + height);
        surfaceAvailable(new Surface(surface), width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
        Log.v(TAG, "onSurfaceTextureSizeChanged " + width + ", " + height);
        surfaceSizeChanged(width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
        Log.v(TAG, "onSurfaceTextureDestroyed");
        surfaceDestroyed();
        Log.v(TAG, "onSurfaceTextureDestroyed - clean up done.");
        return true;
    }

    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surface) {
        // Nothing special to do here
    }

    private native HybridData initHybrid(PlatformContext platformContext);

    private native void surfaceAvailable(Object surface, int width, int height);

    private native void surfaceSizeChanged(int width, int height);

    private native void surfaceDestroyed();

    public native void setMode(String mode);

    public native void setDebugMode(boolean show);

    public native void updateTouchPoints(double[] points);
}
