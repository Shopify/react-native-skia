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

    SkiaViewAPI mApi;
    boolean mDebug;
    public boolean isDropped = false;

    public SkiaTextureView(Context context, SkiaViewAPI api, boolean debug) {
        super(context);
        mApi = api;
        mDebug = debug;
        setOpaque(false);
        setSurfaceTextureListener(this);
    }

    public void createSurfaceTexture() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            Log.i(tag, "Create SurfaceTexture");
            SurfaceTexture surfaceTexture = new SurfaceTexture(false);
            setSurfaceTexture(surfaceTexture);
            onSurfaceTextureAvailable(surfaceTexture, getWidth(), getHeight());
        }
    }

    private void reCreateSurfaceTexture() {
        boolean surfaceIsAlreadyAvailable = getSurfaceTexture() != null;
        if (surfaceIsAlreadyAvailable) {
            createSurfaceTexture();
        }
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
    }

    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        Log.i(tag, "onSurfaceTextureAvailable:  " + width + "x" + height);
        mApi.onSurfaceTextureCreated(surfaceTexture, width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        Log.i(tag, "onSurfaceTextureSizeChanged:  " + width + "x" + height);
        if (isDropped) {
            return;
        }
        mApi.onSurfaceTextureChanged(surfaceTexture, width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
        mApi.onSurfaceDestroyed();
        if (!isDropped) {
            reCreateSurfaceTexture();
        }
        return false;
    }

    private long _prevTimestamp = 0;
    @Override
    public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surface) {
        if (!mDebug) {
            return;
        }
        long timestamp = surface.getTimestamp();
        long frameDuration = (timestamp - _prevTimestamp)/1000000;
        Log.i("SkiaTextureView", "onSurfaceTextureUpdated "+frameDuration+"ms");
        _prevTimestamp = timestamp;
    }
}