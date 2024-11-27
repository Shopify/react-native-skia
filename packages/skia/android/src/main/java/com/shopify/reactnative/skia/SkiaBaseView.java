package com.shopify.reactnative.skia;

import android.content.Context;
import android.os.Build;
import android.util.Log;
import android.view.Surface;
import android.view.View;

import com.facebook.react.views.view.ReactViewGroup;

public abstract class SkiaBaseView extends ReactViewGroup implements SkiaViewAPI {
    private View mView;

    private final boolean debug = false;
    private final String tag = "SkiaView";

    public SkiaBaseView(Context context) {
        super(context);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mView = new SkiaAHBView(context, this, debug);
        } else {
            mView = new SkiaTextureView(context, this, debug);
        }
        addView(mView);
    }

    public void setOpaque(boolean value) {
        if (value) {
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
        mView.layout(0, 0, this.getMeasuredWidth(), this.getMeasuredHeight());
    }

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {
        surfaceAvailable(surface, width, height);
    }

    @Override
    public void onSurfaceChanged(Surface surface, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged " + width + "/" + height);
        surfaceSizeChanged(surface, width, height);
    }

    @Override
    public void onSurfaceDestroyed() {
        surfaceDestroyed();
    }

    protected abstract void surfaceAvailable(Object surface, int width, int height);

    protected abstract void surfaceSizeChanged(Object surface, int width, int height);

    protected abstract void surfaceDestroyed();

    protected abstract void setMode(String mode);

    protected abstract void setDebugMode(boolean show);

    protected abstract void registerView(int nativeId);

    protected abstract void unregisterView();
}