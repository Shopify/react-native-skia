package com.reactnative.skia;

import android.content.Context;
import android.graphics.SurfaceTexture;
import android.os.Build;
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
 * It is backed by a TextureView or a SurfaceView, named by the
 * androidBackingView prop and created once, from the props of the first
 * transaction, for the life of the view (see updateView()), that the native
 * side draws into with Graphite, presenting the queued recordings when the
 * backing view can show them (see FrameScheduler).
 */
public class SkiaView extends ReactViewGroup implements SkiaViewAPI, Choreographer.FrameCallback {
    private static final String TAG = "SkiaView";

    @DoNotStrip
    private HybridData mHybridData;

    // Props. opaque is applied in place, unless the buffer format implies it
    // (see setOpaque), and so are the z-order props where Android allows it
    // (see takesZOrder); the others are read once, when the backing view is
    // created (see updateView()).
    private BackingViewKind mBackingView = BackingViewKind.TEXTURE_VIEW;
    private boolean mOpaque = false;
    private boolean mZOrderOnTop = false;
    private boolean mZOrderMediaOverlay = false;
    private boolean mHighBitDepth = false;

    // The backing view, created by the first prop transaction and kept, with
    // the kind and the buffer format it was created with. The kind is null
    // until then: it is what tells a mounted canvas apart.
    private View mView;
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

    // The backing view is created from the props of the first transaction and
    // kept (see updateView()). React calls a setter again only when its prop
    // changed, so a call on a mounted canvas is a change: the setters below
    // apply it in place where the view can take it, else they ignore it and
    // say so (a canvas that needs another backing view is remounted, with a
    // new key). The JS side warns about the same changes in development
    // (see views/android.ts), mirroring these rules.

    public void setBackingView(@Nullable String value) {
        if (mKind != null) {
            warnIgnoredOnceMounted("android.backingView");
            return;
        }
        mBackingView = BackingViewKind.fromBackingView(value);
    }

    public void setOpaque(boolean value) {
        // The 10-bit format only has 2 bits of alpha: a canvas that got it is
        // opaque whatever the prop says (see BackingViewKind.resolveOpaque).
        if (mKind != null && mSurfaceHighBitDepth) {
            warnIgnoredOnceMounted("android.opaque (a highBitDepth canvas is opaque)");
            return;
        }
        mOpaque = value;
    }

    public void setZOrderOnTop(boolean value) {
        if (takesZOrder("android.zOrderOnTop")) {
            mZOrderOnTop = value;
            applyZOrder();
        }
    }

    public void setZOrderMediaOverlay(boolean value) {
        if (takesZOrder("android.zOrderMediaOverlay")) {
            mZOrderMediaOverlay = value;
            applyZOrder();
        }
    }

    // Whether a z-order prop is taken. Before the backing view exists it is
    // read when the view is created. After that only a SurfaceView has a
    // z-order of its own (elsewhere the prop never applied, and the change is
    // moot), and SurfaceView moves a live surface since Android 11, for an app
    // targeting it; before that, the surface reads it when it is created.
    private boolean takesZOrder(String prop) {
        if (mKind == null) {
            return true;
        }
        if (mKind != BackingViewKind.SURFACE_VIEW) {
            return false;
        }
        boolean inPlace = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                && getContext().getApplicationInfo().targetSdkVersion >= Build.VERSION_CODES.R;
        if (!inPlace) {
            warnIgnoredOnceMounted(prop);
        }
        return inPlace;
    }

    private void applyZOrder() {
        if (mKind == BackingViewKind.SURFACE_VIEW) {
            ((SkiaSurfaceView) mView).setZOrder(mZOrderOnTop, mZOrderMediaOverlay);
        }
    }

    public void setHighBitDepth(boolean value) {
        if (mKind == null) {
            mHighBitDepth = value;
            return;
        }
        // Ignored, and said so, when it would change the buffer format.
        if (BackingViewKind.resolveHighBitDepth(mKind, value) != mSurfaceHighBitDepth) {
            warnIgnoredOnceMounted("highBitDepth");
        }
    }

    private void warnIgnoredOnceMounted(String prop) {
        Log.w(TAG, "Ignoring a change of " + prop + " on a mounted canvas: the backing view"
                + " is chosen when the canvas mounts. Remount the canvas (give it a new key)"
                + " to change it.");
    }

    // Apply the complete prop transaction once, after every prop has arrived.
    // The first one creates the backing view, which is then kept: a
    // SurfaceView must know its buffer format before it attaches (and its
    // z-order, before Android 11), and keeping a canvas on screen while its
    // backing view is replaced takes hold-and-retire logic specific to each
    // Android release (see PRs #4189 and #4192), which this view does not
    // carry. A canvas that needs another backing view is remounted instead,
    // and is off screen for a frame or two until the new view draws its first
    // frame. Later transactions apply the opacity in place: the surface's
    // pixel format on a SurfaceView, the view's opacity on a TextureView (the
    // setters decide what else is taken).
    void updateView() {
        BackingViewKind kind = mKind;
        if (kind != null) {
            boolean opaque = BackingViewKind.resolveOpaque(mOpaque, mSurfaceHighBitDepth);
            switch (kind) {
                case SURFACE_VIEW -> ((SkiaSurfaceView) mView).setOpaque(opaque);
                case TEXTURE_VIEW -> ((SkiaTextureView) mView).setOpaque(opaque);
            }
            return;
        }
        kind = mBackingView;
        mKind = kind;
        mSurfaceHighBitDepth = BackingViewKind.resolveHighBitDepth(kind, mHighBitDepth);
        if (mHighBitDepth && !mSurfaceHighBitDepth) {
            Log.w(TAG, "highBitDepth needs a SurfaceView on Android, keeping the 8-bit format");
        }
        boolean opaque = BackingViewKind.resolveOpaque(mOpaque, mSurfaceHighBitDepth);
        // The surface will have this format: a frame recorded before it
        // exists, or while it is away, is recorded for it.
        if (hasNativeView()) {
            setSurfaceHighBitDepth(mSurfaceHighBitDepth);
        }
        mView = switch (kind) {
            case SURFACE_VIEW -> new SkiaSurfaceView(getContext(), this, mZOrderOnTop,
                    mZOrderMediaOverlay, opaque);
            case TEXTURE_VIEW -> new SkiaTextureView(getContext(), this, opaque);
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

    private native void setSurfaceHighBitDepth(boolean highBitDepth);

    native void registerView(int nativeId);

    private native void unregisterView();

    /** Presents the queued recordings, returning whether any are left. */
    private native boolean presentFrame();
}
