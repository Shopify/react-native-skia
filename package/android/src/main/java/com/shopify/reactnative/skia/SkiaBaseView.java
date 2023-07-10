package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.TextureView;

import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.views.view.ReactViewGroup;

public abstract class SkiaBaseView extends ReactViewGroup implements TextureView.SurfaceTextureListener {

    @DoNotStrip
    private Surface mSurface;
    private TextureView mTexture;

    public SkiaBaseView(Context context) {
        super(context);
        setWillNotDraw(false);
        mTexture = new TextureView(context);
        mTexture.setSurfaceTextureListener(this);
        mTexture.setOpaque(false);
        addView(mTexture);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        // If we haven't got a surface yet, let's ask the view to
        // draw into a bitmap and then render the bitmap. This method
        // is typically only called once - for the first frame, and
        // then the surface will be available and all rendering will
        // be done directly to the surface itself.
        if (isMainThreadRendererSupported() && mSurface == null) {
            int width = getWidth();
            int height = getHeight();

            if (width > 0 && height > 0) {
                Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                Bitmap result = (Bitmap) renderToBitmap((Object) bitmap, width, height);

                canvas.drawBitmap(
                        result,
                        new Rect(0, 0, width, height),
                        new Rect(0, 0, width, height),
                        null);
            }
        }
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        mTexture.layout(0, 0, this.getMeasuredWidth(), this.getMeasuredHeight());
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
        Log.i("SkiaBaseView", "onSurfaceTextureAvailable");
        mSurface = new Surface(surface);
        surfaceAvailable(mSurface, width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
        Log.i("SkiaBaseView", "onSurfaceTextureSizeChanged");
        surfaceSizeChanged(width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
        Log.i("SkiaBaseView", "onSurfaceTextureDestroyed");
        // Notify the native side
        surfaceDestroyed();
        mSurface = null;
        // https://developer.android.com/reference/android/view/TextureView.SurfaceTextureListener#onSurfaceTextureDestroyed(android.graphics.SurfaceTexture)
        // Invoked when the specified SurfaceTexture is about to be destroyed. If returns true,
        // no rendering should happen inside the surface texture after this method is invoked.
        // We've measured this and it seems like we need to call release and return true - and
        // then handle the issue with this being ripped out underneath the native layer in the C++
        // code.
        // Return true - we promise that no more rendering will be done now.
        return true;
    }

    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surface) {
        // Nothing special to do here
    }

    /**
     * Returns true if the view is able to directly render on the
     * main thread. This can f.ex then be used to create a first frame
     * render of the view. Returns true by default - override if not.
     */
    protected boolean isMainThreadRendererSupported() {
        return true;
    }

    protected abstract void surfaceAvailable(Object surface, int width, int height);

    protected abstract void surfaceSizeChanged(int width, int height);

    protected abstract void surfaceDestroyed();

    protected abstract void setMode(String mode);

    protected abstract void setDebugMode(boolean show);

    protected abstract void updateTouchPoints(double[] points);

    protected abstract void registerView(int nativeId);

    protected abstract void unregisterView();

    protected abstract Object renderToBitmap(Object bitmap, int width, int height);
}
