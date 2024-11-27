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
    private boolean isDropped = false;

    SkiaViewAPI mApi;
    boolean mDebug;

    public SkiaTextureView(Context context, SkiaViewAPI api, boolean debug) {
        super(context);
        mApi = api;
        mDebug = debug;
        setOpaque(false);
        setSurfaceTextureListener(this);
    }


    void dropInstance() {
        isDropped = true;
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (this.getMeasuredWidth() == 0) {
            createSurfaceTexture();
        }
    }

    private void createSurfaceTexture() {
        // This API Level is >= 26, we created our own SurfaceTexture to have a faster time to first frame
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            Log.i(tag, "Create SurfaceTexture");
            SurfaceTexture surface = new SurfaceTexture(false);
            setSurfaceTexture(surface);
            onSurfaceTextureAvailable(surface, this.getMeasuredWidth(), this.getMeasuredHeight());
        }
    }


    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        mApi.onSurfaceTextureCreated(surfaceTexture, width, height);
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int width, int height) {
        mApi.onSurfaceTextureCreated(surfaceTexture, width, height);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
        Log.i(tag, "onSurfaceTextureDestroyed");
        // https://developer.android.com/reference/android/view/TextureView.SurfaceTextureListener#onSurfaceTextureDestroyed(android.graphics.SurfaceTexture)
        mApi.onSurfaceDestroyed();
        // Because of React Native Screens (which dettach the view), we always keep the surface alive.
        // If not, Texture view will recreate the texture surface by itself and
        // we will lose the fast first time to frame.
        // We only delete the surface when the view is dropped (destroySurface invoked by SkiaBaseViewManager);
        if (!isDropped) {
            createSurfaceTexture();
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