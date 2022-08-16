package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.SurfaceTexture;
import android.view.Surface;
import android.view.TextureView;
import android.view.MotionEvent;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

public class SkiaDrawView extends TextureView implements TextureView.SurfaceTextureListener {

    private static final String TAG = "Java::JniSkiaDrawView";

    @DoNotStrip
    private HybridData mHybridData;

    @DoNotStrip
    private boolean mViewRemoved;

    @DoNotStrip
    private Surface mSurface;

    public SkiaDrawView(Context ctx) {
        super(ctx);
        RNSkiaModule skiaModule = ((ReactContext)ctx).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
        setSurfaceTextureListener(this);
        setOpaque(false);
    }

    @Override
    public void setBackgroundColor(int color) {
        // Texture view does not support setting the background color.
    }

    public void releaseSurface() {
        if(mSurface != null) {
            mSurface.release();
            mSurface = null;
        }
        // We can only reset the native side when the view was removed from screen.
        // releasing the surface can also be done when the view is hidden and then
        // we should only release the surface - and keep the native part around.
        if(mViewRemoved) {
            mHybridData.resetNative();
        }
    }

    void onViewRemoved() {
        mViewRemoved = true;
        // We can only reset the native side when the view was removed from screen.
        // releasing the surface can also be done when the view is hidden and then
        // we should only release the surface - and keep the native part around.
        if(mSurface == null) {
            mHybridData.resetNative();
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        // https://developer.android.com/training/gestures/multi
        int action = ev.getActionMasked();

        MotionEvent.PointerCoords r = new MotionEvent.PointerCoords();

        double[] points;

        // If this is a pointer_up/down event we need to handle it a bit specialized
        switch (action) {
            case MotionEvent.ACTION_POINTER_DOWN:
            case MotionEvent.ACTION_POINTER_UP: {
                points = new double[5];
                int pointerIndex = ev.getActionIndex();
                ev.getPointerCoords(pointerIndex, r);
                points[0] = r.x;
                points[1] = r.y;
                points[2] = ev.getPressure(pointerIndex);
                points[3] = motionActionToType(action);
                points[4] = ev.getPointerId(pointerIndex);

                updateTouchPoints(points);

                break;
            }
            default: {
                // For the rest we can just handle it like expected
                int count = ev.getPointerCount();
                int pointerIndex = 0;
                points = new double[5 * count];
                for (int i = 0; i < count; i++) {
                    ev.getPointerCoords(i, r);
                    points[pointerIndex++] = r.x;
                    points[pointerIndex++] = r.y;
                    points[pointerIndex++] = ev.getPressure(i);
                    points[pointerIndex++] = motionActionToType(action);
                    points[pointerIndex++] = ev.getPointerId(i);
                }

                updateTouchPoints(points);

                break;
            }
        }

        return true;
    }

    private static int motionActionToType(int action) {
        int actionType = 3;
        switch (action) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_POINTER_DOWN:
                actionType = 0;
                break;
            case MotionEvent.ACTION_MOVE:
                actionType = 1;
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                actionType = 2;
                break;
            case MotionEvent.ACTION_CANCEL:
                actionType = 3;
                break;
        }
        return actionType;
    }

    @Override
    public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
        mSurface = new Surface(surface);
        surfaceAvailable(mSurface, width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
        surfaceSizeChanged(width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
        surfaceDestroyed();
        // https://developer.android.com/reference/android/view/TextureView.SurfaceTextureListener#onSurfaceTextureDestroyed(android.graphics.SurfaceTexture)
        // Invoked when the specified SurfaceTexture is about to be destroyed. If returns true,
        // no rendering should happen inside the surface texture after this method is invoked.
        // When returning false, the client needs to call SurfaceTexture#release().
        return false;
    }

    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surface) {
        // Nothing special to do here
    }

    private native HybridData initHybrid(SkiaManager skiaManager);

    private native void surfaceAvailable(Object surface, int width, int height);

    private native void surfaceSizeChanged(int width, int height);

    private native void surfaceDestroyed();

    private native void setBgColor(int color);

    public native void setMode(String mode);

    public native void setDebugMode(boolean show);

    public native void updateTouchPoints(double[] points);
}
