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
 * backing view can show them (see FrameScheduler). The window surface and
 * every present live on the PresentThread: the main thread relays the props,
 * the layout and the backing view's callbacks to it.
 */
public class SkiaView extends ReactViewGroup implements SkiaViewAPI, Choreographer.FrameCallback {
    private static final String TAG = "SkiaView";

    @DoNotStrip
    private HybridData mHybridData;

    // Main thread: React dropped the view (see dropInstance). The main thread
    // calls no native method after that, and the present thread destroys the
    // native view once it is done with it.
    private boolean mDropped = false;

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
    // until then: it is what tells a mounted canvas apart. Written once on the
    // main thread, read on the present thread.
    private View mView;
    @Nullable
    private volatile BackingViewKind mKind = null;
    private boolean mSurfaceHighBitDepth = false;

    // Main thread, but for the presents it is told of. Only a SurfaceView's
    // surface is voted on, from Android 11 (see onSurfaceCreated).
    private final SurfaceFrameRateVote mFrameRateVote = new SurfaceFrameRateVote(this);
    private volatile boolean mVotesOnPresents = false;

    // Present thread.
    private final Runnable mPostedPresent = this::onPostedPresent;
    private final FrameScheduler mFrameScheduler = new FrameScheduler(new FrameScheduler.Host() {
        @Override
        public void postFrameCallback() {
            Choreographer.getInstance().postFrameCallback(SkiaView.this);
        }

        @Override
        public void postPresent() {
            PresentThread.post(mPostedPresent);
        }

        @Override
        public FrameScheduler.NextFrame presentFrame(int vsyncs) {
            return hasNativeView()
                    ? FrameScheduler.NextFrame.fromNative(SkiaView.this.presentFrame(vsyncs))
                    : FrameScheduler.NextFrame.NONE;
        }
    });

    // Main thread: the TextureView's latch, handed to the present thread.
    private final FrameLatchRelay mFrameLatchRelay = new FrameLatchRelay(new FrameLatchRelay.Host() {
        @Override
        public void postBehindDraw(Runnable task) {
            post(task);
        }

        @Override
        public void postToPresentThread(Runnable task) {
            PresentThread.post(task);
        }

        @Override
        public void frameLatched() {
            if (hasNativeView()) {
                SkiaView.this.frameLatched();
                mFrameScheduler.onFrameLatched();
            }
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
        if (!mDropped) {
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
    // recordings, the swapchain) is invisible to it. The present thread
    // destroys it once it is done presenting, and its destructors release all
    // of that. The backing view may still call back after this, it leaves the
    // window around the same time: see hasNativeView().
    void dropInstance() {
        if (mDropped) {
            return;
        }
        mDropped = true;
        unregisterView();
        PresentThread.post(() -> {
            stopFrames();
            mHybridData.resetNative();
        });
    }

    // Present thread: whether the native view still exists. The present
    // thread destroys it (see dropInstance), and no native method may be
    // called after that.
    private boolean hasNativeView() {
        return mHybridData.isValid();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        // The backing view gets this exact size, and so does its surface: tell
        // the native side now, so that a frame recorded before the surface
        // exists (the first one usually is) already has the right size.
        if (!mDropped) {
            setLayoutSize(right - left, bottom - top);
        }
        if (mView != null) {
            mView.layout(0, 0, right - left, bottom - top);
        }
    }

    // Frames --------------------------------------------------------------

    /** A recording was submitted. Present thread; called from native. */
    @DoNotStrip
    public void scheduleFrame() {
        mFrameScheduler.requestFrame(mKind);
    }

    /**
     * A frame went to the backing view's surface. Present thread; called from
     * native. Only a SurfaceView votes (attached in onSurfaceCreated): a
     * TextureView is composited into its window, which votes for it.
     */
    @DoNotStrip
    public void onFramePresented() {
        if (!mVotesOnPresents) {
            return;
        }
        long presentedAtNanos = System.nanoTime();
        post(() -> mFrameRateVote.onFramePresented(presentedAtNanos));
    }

    /** The present thread's Choreographer frame (see FrameScheduler.Host.postFrameCallback). */
    @Override
    public void doFrame(long frameTimeNanos) {
        mFrameScheduler.onFrame(mKind);
    }

    private void onPostedPresent() {
        mFrameScheduler.onPosted();
    }

    // Present thread: the view asks for no more frames.
    private void stopFrames() {
        Choreographer.getInstance().removeFrameCallback(this);
        PresentThread.remove(mPostedPresent);
        mFrameScheduler.cancel();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        PresentThread.post(this::stopFrames);
    }

    // A no-op for a dropped view (see dropInstance), which every mounted view
    // is eventually.
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    // Surfaces ------------------------------------------------------------

    // The backing view calls these on the main thread; each runs on the
    // present thread, after the ones before it, so a surface is attached,
    // resized and detached in the order its callbacks came.

    // SurfaceView callbacks: the native side receives an android.view.Surface.

    @Override
    public void onSurfaceCreated(Surface surface, int width, int height) {
        mFrameRateVote.attach(surface);
        mVotesOnPresents = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R;
        boolean highBitDepth = mSurfaceHighBitDepth;
        boolean latchesOnWindowDraw = BackingViewKind.latchesOnWindowDraw(BackingViewKind.SURFACE_VIEW);
        PresentThread.post(() -> {
            if (hasNativeView()) {
                surfaceAvailable(surface, width, height, true, highBitDepth, latchesOnWindowDraw);
            }
        });
    }

    @Override
    public void onSurfaceChanged(Surface surface, int width, int height) {
        Log.i(TAG, "onSurfaceChanged " + width + "/" + height);
        boolean highBitDepth = mSurfaceHighBitDepth;
        boolean latchesOnWindowDraw = BackingViewKind.latchesOnWindowDraw(BackingViewKind.SURFACE_VIEW);
        PresentThread.post(() -> {
            if (hasNativeView()) {
                surfaceSizeChanged(surface, width, height, true, highBitDepth, latchesOnWindowDraw);
            }
        });
    }

    // TextureView callbacks: the native side receives the SurfaceTexture and
    // creates the Surface it draws into. The 10-bit format is never used here.

    @Override
    public void onSurfaceTextureCreated(SurfaceTexture surface, int width, int height) {
        boolean latchesOnWindowDraw = BackingViewKind.latchesOnWindowDraw(BackingViewKind.TEXTURE_VIEW);
        PresentThread.post(() -> {
            if (hasNativeView()) {
                surfaceAvailable(surface, width, height, false, false, latchesOnWindowDraw);
            }
        });
    }

    @Override
    public void onSurfaceTextureChanged(SurfaceTexture surface, int width, int height) {
        Log.i(TAG, "onSurfaceTextureSizeChanged " + width + "/" + height);
        boolean latchesOnWindowDraw = BackingViewKind.latchesOnWindowDraw(BackingViewKind.TEXTURE_VIEW);
        PresentThread.post(() -> {
            if (hasNativeView()) {
                surfaceSizeChanged(surface, width, height, false, false, latchesOnWindowDraw);
            }
        });
    }

    @Override
    public void onSurfaceTextureUpdated() {
        mFrameLatchRelay.onWindowDrewFrame();
    }

    // The surface goes away once this returns: the present thread lets go of
    // it first. It never waits on the GPU (see RNSkPresentHold), so the wait
    // is at most the present in progress.
    @Override
    public void onSurfaceDestroyed() {
        // The surface is still valid here, so the vote can be taken back.
        mVotesOnPresents = false;
        mFrameRateVote.detach();
        PresentThread.runAndWait(() -> {
            if (hasNativeView()) {
                surfaceDestroyed();
            }
        });
    }

    // Native ---------------------------------------------------------------

    private native HybridData initHybrid(SkiaManager skiaManager);

    // isSurface tells the native side whether `surface` is an
    // android.view.Surface (SurfaceView) or a SurfaceTexture (TextureView);
    // latchesOnWindowDraw, whether a frame waits for the window to draw the
    // one before it (see BackingViewKind.latchesOnWindowDraw).
    private native void surfaceAvailable(Object surface, int width, int height, boolean isSurface, boolean highBitDepth, boolean latchesOnWindowDraw);

    private native void surfaceSizeChanged(Object surface, int width, int height, boolean isSurface, boolean highBitDepth, boolean latchesOnWindowDraw);

    private native void surfaceDestroyed();

    private native void setLayoutSize(int width, int height);

    private native void setSurfaceHighBitDepth(boolean highBitDepth);

    native void registerView(int nativeId);

    private native void unregisterView();

    /**
     * Presents what is waiting, for vsyncs vsyncs, and returns the value of
     * RNSkView::NextFrame: whether a frame is still waiting or coming (see
     * FrameScheduler.NextFrame). Present thread.
     */
    private native int presentFrame(int vsyncs);

    private native void frameLatched();
}
