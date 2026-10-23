package com.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.PixelFormat;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import androidx.annotation.NonNull;

@SuppressLint("ViewConstructor")
public class SkiaSurfaceView extends SurfaceView implements SurfaceHolder.Callback {

    SkiaViewAPI mApi;
    // The z-order last asked of SurfaceView, which starts as neither on top nor
    // a media overlay: setZOrder() asks only for a change.
    private boolean mZOrderOnTop = false;
    private boolean mZOrderMediaOverlay = false;

    public SkiaSurfaceView(Context context, SkiaViewAPI api, boolean zOrderOnTop,
            boolean zOrderMediaOverlay, boolean opaque) {
        super(context);
        mApi = api;
        // Both are read when the surface is created.
        setZOrder(zOrderOnTop, zOrderMediaOverlay);
        setOpaque(opaque);
        getHolder().addCallback(this);
    }

    // The format drives the compositor's opaque flag for this layer. It can
    // change on a live surface: SurfaceView reports it through surfaceChanged.
    public void setOpaque(boolean opaque) {
        getHolder().setFormat(opaque ? PixelFormat.OPAQUE : PixelFormat.TRANSLUCENT);
    }

    // The sublayer the surface is composited at, relative to the window: above
    // it (on top), or below it, above the other SurfaceViews there (media
    // overlay) or among them (the default). setZOrderOnTop(false) resets the
    // request to the default, so it goes first. Where Android allows it (see
    // BackingViewKind), a live surface takes a changed request with the
    // window's next frame, which invalidate() schedules; elsewhere, the request
    // is read when the surface is created.
    public void setZOrder(boolean onTop, boolean mediaOverlay) {
        if (onTop == mZOrderOnTop && mediaOverlay == mZOrderMediaOverlay) {
            return;
        }
        mZOrderOnTop = onTop;
        mZOrderMediaOverlay = mediaOverlay;
        setZOrderOnTop(onTop);
        if (!onTop) {
            setZOrderMediaOverlay(mediaOverlay);
        }
        invalidate();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        mApi.onSurfaceDestroyed();
    }

    @Override
    public void surfaceCreated(@NonNull SurfaceHolder holder) {
        mApi.onSurfaceCreated(holder.getSurface(), getWidth(), getHeight());
    }

    @Override
    public void surfaceChanged(@NonNull SurfaceHolder holder, int format, int width, int height) {
        mApi.onSurfaceChanged(holder.getSurface(), getWidth(), getHeight());
    }

    @Override
    public void surfaceDestroyed(@NonNull SurfaceHolder holder) {
        mApi.onSurfaceDestroyed();
    }
}
