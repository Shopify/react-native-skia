package com.reactnative.skia;

import android.content.Context;
import android.graphics.SurfaceTexture;
import android.util.Log;
import android.view.Choreographer;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.views.view.ReactViewGroup;

/**
 * The Android view behind <Canvas>, <SkiaPictureView> and <SkiaGraphiteView>.
 * It is backed by a SurfaceView or a TextureView, chosen once from the props
 * of the first transaction and kept for the life of the view (see
 * updateView()), that the native side draws into with Graphite, presenting the
 * queued recordings when the backing view can show them (see FrameScheduler).
 */
public class SkiaView extends ReactViewGroup implements SkiaViewAPI, Choreographer.FrameCallback {
    private static final String TAG = "SkiaView";

    @DoNotStrip
    private HybridData mHybridData;

    // The backing view, created by the first prop transaction and kept.
    private View mView;

    // Props. Only opaque is applied in place; the others are read once, when
    // the backing view is created (see updateView()). A null kind is "auto".
    private boolean mOpaque = false;
    @Nullable
    private BackingViewKind mRequestedKind = null;
    private boolean mZOrderOnTop = false;
    private boolean mHighBitDepth = false;

    // What the backing view was created with; no kind before it exists.
    @Nullable
    private BackingViewKind mKind = null;
    private boolean mSurfaceHighBitDepth = false;

    private final SurfaceFrameRateVote mFrameRateVote = new SurfaceFrameRateVote(this);
    private final Runnable mPostedPresent = this::onPostedPresent;
    private final FrameScheduler mFrameScheduler = new FrameScheduler(new FrameScheduler.Host() {
        @Override
        public void postFrameCallback() {
            Choreographer.getInstance().postFrameCallback(SkiaView.this);
        }

        @Override
        public void postBehindPendingDraw() {
            post(mPostedPresent);
        }

        @Override
        public boolean presentFrame() {
            if (!hasNativeView()) {
                return false;
            }
            boolean moreQueued = SkiaView.this.presentFrame();
            // Only a SurfaceView votes (attached in onSurfaceCreated): a
            // TextureView is composited into its window, which votes for it.
            // A frame the surface could not take counts as presented here,
            // which at worst votes a frame early.
            mFrameRateVote.onFramePresented();
            return moreQueued;
        }
    });

    public SkiaView(Context context) {
        super(context);
        // ReactViewGroup disables clipChildren (RN overflow is handled with canvas
        // clipping instead). Android copies the parent's clipChildren into each
        // child's RenderNode.clipToBounds, and HWUI treats a damaged node without
        // it as unbounded damage (RenderNode::damageSelf). The TextureView child
        // invalidates on every frame, so without this every non-opaque canvas
        // frame repaints the whole window. Our only child exactly fills this
        // view, so clipping it changes nothing visually.
        setClipChildren(true);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // When pointerEvents is "none" or "box-none", make this view completely
        // transparent to touch dispatch so events pass through to views behind it
        if (!PointerEvents.canBeTouchTarget(getPointerEvents())) {
            return false;
        }
        return super.dispatchTouchEvent(ev);
    }

    public void setOpaque(boolean value) {
        mOpaque = value;
    }

    public void setSurfaceType(@Nullable String value) {
        if (ignoredOnceMounted("android.surfaceType")) {
            return;
        }
        mRequestedKind = BackingViewKind.fromSurfaceType(value);
    }

    public void setZOrderOnTop(boolean value) {
        if (ignoredOnceMounted("android.zOrderOnTop")) {
            return;
        }
        mZOrderOnTop = value;
    }

    public void setHighBitDepth(boolean value) {
        if (ignoredOnceMounted("highBitDepth")) {
            return;
        }
        mHighBitDepth = value;
    }

    // The backing view is chosen from the props of the first transaction and
    // kept (see updateView()). React calls a setter again only when its prop
    // changed, so a call after that is a change, which is ignored: a canvas
    // that needs another backing view is remounted (given a new key).
    private boolean ignoredOnceMounted(String prop) {
        if (mView == null) {
            return false;
        }
        Log.w(TAG, prop + " changed on a mounted canvas and is ignored: the backing view"
                + " is chosen when the canvas mounts. Remount the canvas (give it a new key)"
                + " to change it.");
        return true;
    }

    // Resolve the backing view from the props. "auto" picks SurfaceView for an
    // opaque canvas and TextureView for a non-opaque one.
    private BackingViewKind resolveKind() {
        if (mRequestedKind != null) {
            return mRequestedKind;
        }
        return mOpaque ? BackingViewKind.SURFACE_VIEW : BackingViewKind.TEXTURE_VIEW;
    }

    // The 10-bit buffer format only has 2 bits of alpha, which would visibly
    // break translucency, and the extra precision would be lost in the 8-bit
    // composition pass of a TextureView anyway. So the flag only applies to an
    // opaque SurfaceView.
    private boolean resolveHighBitDepth(BackingViewKind kind) {
        if (!mHighBitDepth) {
            return false;
        }
        if (kind != BackingViewKind.SURFACE_VIEW || !mOpaque) {
            Log.w(TAG, "highBitDepth requires an opaque SurfaceView on Android, falling back to the 8-bit format");
            return false;
        }
        return true;
    }

    // Apply the complete prop transaction once, after every prop has arrived.
    // The first one creates the backing view, which is then kept: a
    // SurfaceView must know zOrderOnTop and its buffer format before it
    // attaches, and replacing a backing view on screen hands the canvas from
    // one view to another, which no release of Android does without a frame
    // of nothing, or of black, in between (the two views are composited by
    // different frames). A canvas that needs another backing view is
    // remounted instead. Opacity is applied in place: the surface's pixel
    // format on a SurfaceView, the view's opacity on a TextureView.
    void updateView() {
        if (mView != null) {
            switch (mKind) {
                case SURFACE_VIEW -> ((SkiaSurfaceView) mView).setOpaque(mOpaque);
                case TEXTURE_VIEW -> ((SkiaTextureView) mView).setOpaque(mOpaque);
            }
            return;
        }
        BackingViewKind kind = resolveKind();
        boolean zOrderOnTop = kind == BackingViewKind.SURFACE_VIEW && mZOrderOnTop;
        mKind = kind;
        mSurfaceHighBitDepth = resolveHighBitDepth(kind);
        mView = switch (kind) {
            case SURFACE_VIEW -> new SkiaSurfaceView(getContext(), this, zOrderOnTop, mOpaque);
            case TEXTURE_VIEW -> new SkiaTextureView(getContext(), this, mOpaque);
        };
        addView(mView);
        // React Native sizes native children explicitly through onLayout, so
        // the requestLayout triggered by addView is ignored; size the new
        // child ourselves or it stays 0x0 and never gets a surface.
        if (getWidth() > 0 || getHeight() > 0) {
            mView.layout(0, 0, getWidth(), getHeight());
        }
    }

    // React drops the view for good: it is never recycled (ReactViewManager
    // only sets up recycling for its exact class). The native view behind it
    // would otherwise live on until this object is finalized, which the
    // garbage collector may never get to: the GPU memory the view holds (its
    // Graphite recorder and resource cache, the queued and last presented
    // recordings, the swapchain) is invisible to it. Destroy it now, its
    // destructors release all of that. The backing view may still call back
    // after this, it leaves the window around the same time: see hasNativeView().
    void dropInstance() {
        if (!hasNativeView()) {
            return;
        }
        unregisterView();
        mHybridData.resetNative();
    }

    // Whether the native view still exists. It is destroyed in dropInstance(),
    // and no native method may be called after that.
    private boolean hasNativeView() {
        return mHybridData.isValid();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        // The backing view gets this exact size, and so does its surface: tell
        // the native side now, so that a frame recorded before the surface
        // exists (the first one usually is) already has the right size.
        if (hasNativeView()) {
            setLayoutSize(right - left, bottom - top);
        }
        if (mView != null) {
            mView.layout(0, 0, right - left, bottom - top);
        }
    }

    // Frames --------------------------------------------------------------

    /** A recording was submitted. Main thread; called from native. */
    @DoNotStrip
    public void scheduleFrame() {
        mFrameScheduler.requestFrame(mKind);
    }

    @Override
    public void doFrame(long frameTimeNanos) {
        mFrameScheduler.onFrame(mKind);
    }

    private void onPostedPresent() {
        mFrameScheduler.onPosted();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        Choreographer.getInstance().removeFrameCallback(this);
        removeCallbacks(mPostedPresent);
        mFrameScheduler.cancel();
    }

    // A no-op for a dropped view (see dropInstance), which every mounted view
    // is eventually.
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    // Surfaces ------------------------------------------------------------

    // SurfaceView callbacks: the native side receives an android.view.Surface.

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {
        mFrameRateVote.attach(surface);
        if (!hasNativeView()) {
            return;
        }
        surfaceAvailable(surface, width, height, true, mSurfaceHighBitDepth);
    }

    @Override
    public void onSurfaceChanged(Surface surface, int width, int height) {
        Log.i(TAG, "onSurfaceChanged " + width + "/" + height);
        if (!hasNativeView()) {
            return;
        }
        surfaceSizeChanged(surface, width, height, true, mSurfaceHighBitDepth);
    }

    // TextureView callbacks: the native side receives the SurfaceTexture and
    // creates the Surface it draws into. The 10-bit format is never used here.

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        if (!hasNativeView()) {
            return;
        }
        surfaceAvailable(surface, width, height, false, false);
    }

    @Override
    public void onSurfaceTextureChanged(SurfaceTexture surface, int width, int height) {
        Log.i(TAG, "onSurfaceTextureSizeChanged " + width + "/" + height);
        if (!hasNativeView()) {
            return;
        }
        surfaceSizeChanged(surface, width, height, false, false);
    }

    @Override
    public void onSurfaceDestroyed() {
        // The surface is still valid here, so the vote can be taken back.
        mFrameRateVote.detach();
        if (!hasNativeView()) {
            return;
        }
        surfaceDestroyed();
    }

    // Native ---------------------------------------------------------------

    private native HybridData initHybrid(SkiaManager skiaManager);

    // isSurface tells the native side whether `surface` is an
    // android.view.Surface (SurfaceView) or a SurfaceTexture (TextureView).
    private native void surfaceAvailable(Object surface, int width, int height, boolean isSurface, boolean highBitDepth);

    private native void surfaceSizeChanged(Object surface, int width, int height, boolean isSurface, boolean highBitDepth);

    private native void surfaceDestroyed();

    private native void setLayoutSize(int width, int height);

    native void registerView(int nativeId);

    private native void unregisterView();

    /** Presents the queued recordings, returning whether any are left. */
    private native boolean presentFrame();
}
