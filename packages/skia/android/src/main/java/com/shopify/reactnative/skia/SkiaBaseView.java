package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.Surface;
import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.views.view.ReactViewGroup;

public abstract class SkiaBaseView extends ReactViewGroup implements SkiaViewAPI {
    private View mView;
    private final Matrix mMatrix = new Matrix();

    private final boolean debug = false;
    private boolean mSurfaceAvailable = false;
    private Bitmap mBitmap = null;
    private final String tag = "SkiaView";

    public SkiaBaseView(Context context) {
        super(context);
        mView = new SkiaTextureView(context, this, debug);
        addView(mView);
    }

    public void setOpaque(boolean value) {
        if (value && mView instanceof SkiaTextureView) {
            removeView(mView);
            mView = new SkiaSurfaceView(getContext(), this, debug);
            addView(mView);
        } else if (!value && mView instanceof SkiaSurfaceView) {
            removeView(mView);
            mView = new SkiaSurfaceView(getContext(), this, debug);
            addView(mView);
        }
    }

    void dropInstance() {
        unregisterView();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        mView.layout(0, 0, getWidth(), getHeight());
        if (!mSurfaceAvailable && mView instanceof SkiaTextureView) {
            mBitmap = Bitmap.createBitmap(getWidth(), getHeight(), Bitmap.Config.ARGB_8888);
            drawBitmap(mBitmap, getWidth(), getHeight());
            setWillNotDraw(false);
        }
    }

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {;
        surfaceAvailable(surface, width, height, true);
    }

    @Override
    public void onSurfaceChanged(Surface surface, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged " + width + "/" + height);
        surfaceSizeChanged(surface, width, height, true);
    }

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        mSurfaceAvailable = true;
        surfaceAvailable(surface, width, height, false);
    }

    @Override
    public void onSurfaceTextureChanged(SurfaceTexture surface, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged " + width + "/" + height);
        surfaceSizeChanged(surface, width, height, false);
    }

    @Override
    protected void onDraw(@NonNull Canvas canvas) {
        super.onDraw(canvas);
        if (mBitmap != null) {
            canvas.drawBitmap(mBitmap, mMatrix, null);
        }
    }

    @Override
    public void onSurfaceDestroyed() {
        surfaceDestroyed();
    }

    protected abstract void drawBitmap(Object bitmap, int width, int height);

    protected abstract void surfaceAvailable(Object surface, int width, int height, boolean opaque);

    protected abstract void surfaceSizeChanged(Object surface, int width, int height, boolean opaque);

    protected abstract void surfaceDestroyed();

    protected abstract void setMode(String mode);

    protected abstract void setDebugMode(boolean show);

    protected abstract void registerView(int nativeId);

    protected abstract void unregisterView();
}