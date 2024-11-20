package com.shopify.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.Surface;
import android.view.TextureView;
import androidx.annotation.NonNull;

import com.shopify.reactnative.skia.SkiaViewAPI;

@SuppressLint("ViewConstructor")
public class SkiaTextureView extends TextureView implements TextureView.SurfaceTextureListener {

    SkiaViewAPI mApi;
    boolean mDebug;

    public SkiaTextureView(Context context, SkiaViewAPI api, boolean debug) {
        super(context);
        mApi = api;
        mDebug = debug;
        setOpaque(false);
        setSurfaceTextureListener(this);
    }

    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        Surface surface = new Surface(surfaceTexture);
        mApi.onSurfaceCreated(surface, width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        mApi.onSurfaceChanged(width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
        mApi.onSurfaceDestroyed();
        return true;
    }

    private long _prevTimestamp = 0;
    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surface) {
        if (!mDebug) {
            return;
        }
        long timestamp = surface.getTimestamp();
        long frameDuration = (timestamp - _prevTimestamp)/1000000;
        Log.i("SkiaTextureView", "onSurfaceTextureUpdated "+frameDuration+"ms");
        _prevTimestamp = timestamp;
    }
}