package com.shopify.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.Surface;
import android.view.TextureView;
import androidx.annotation.NonNull;

@SuppressLint("ViewConstructor")
public class SkiaTextureView extends TextureView implements TextureView.SurfaceTextureListener {

    private String tag = "SkiaTextureView";
    private static final int MIN_FRAMES_BEFORE_READY = 2;

    SkiaViewAPI mApi;
    boolean mDebug;
    private boolean mFirstFrameDispatched = false;
    private int mFramesRendered = 0;

    public SkiaTextureView(Context context, SkiaViewAPI api, boolean debug) {
        super(context);
        mApi = api;
        mDebug = debug;
        setOpaque(false);
        setSurfaceTextureListener(this);
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
    }

    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        Log.i(tag, "onSurfaceTextureAvailable:  " + width + "x" + height);
        mFirstFrameDispatched = false;
        mFramesRendered = 0;
        mApi.onSurfaceTextureCreated(surfaceTexture, width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged:  " + width + "x" + height);
        mApi.onSurfaceTextureChanged(surfaceTexture, width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
        mFirstFrameDispatched = false;
        mFramesRendered = 0;
        mApi.onSurfaceDestroyed();
        return true;
    }

    private long _prevTimestamp = 0;
    @Override
    public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surface) {
        mFramesRendered++;
        if (!mDebug) {
            if (!mFirstFrameDispatched && mFramesRendered >= MIN_FRAMES_BEFORE_READY) {
                mFirstFrameDispatched = true;
                mApi.onFirstFrameRendered();
            }
            return;
        }
        long timestamp = surface.getTimestamp();
        long frameDuration = (timestamp - _prevTimestamp)/1000000;
        Log.i("SkiaTextureView", "onSurfaceTextureUpdated "+frameDuration+"ms");
        _prevTimestamp = timestamp;
        if (!mFirstFrameDispatched && mFramesRendered >= MIN_FRAMES_BEFORE_READY) {
            mFirstFrameDispatched = true;
            mApi.onFirstFrameRendered();
        }
    }
}
