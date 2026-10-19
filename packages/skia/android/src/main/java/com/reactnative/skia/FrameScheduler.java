package com.reactnative.skia;

import androidx.annotation.Nullable;

/**
 * Decides when a SkiaView presents the recordings queued for it: a SurfaceView
 * on the next vsync, a TextureView behind the draw its window has pending, so
 * that the window has taken the previous frame by then. While a replay is in
 * flight it asks for every vsync, whose present paces the replays. A vsync's
 * present that the main thread reaches only once the next vsync has come goes
 * behind that frame's draw, once, so that the window's frame never waits for
 * it. Keeps at most one frame callback and one posted present outstanding.
 * Main thread.
 */
final class FrameScheduler {
    /** What the view still needs after a present. */
    enum NextFrame {
        /** Nothing is waiting or coming. */
        NONE,
        /** A frame is waiting: it is tried again on the next vsync. */
        WAITING,
        /** A replay is in flight: its recording is presented as soon as it comes. */
        COMING;

        /** The value of RNSkView::NextFrame the native view returned. */
        static NextFrame fromNative(int value) {
            return switch (value) {
                case 0 -> NONE;
                case 1 -> WAITING;
                case 2 -> COMING;
                default -> throw new IllegalArgumentException("Unknown NextFrame " + value);
            };
        }
    }

    /** What the scheduler asks of the view. */
    interface Host {
        /** Calls onFrame() on the next Choreographer frame. */
        void postFrameCallback();

        /** Calls onPosted() from the main looper, behind any draw the window has pending. */
        void postBehindPendingDraw();

        /**
         * Presents what is waiting. vsyncs is how many vsyncs asked for this
         * present: none for the one a submitted recording asked for.
         */
        NextFrame presentFrame(int vsyncs);

        /** Now, on the clock of Choreographer's frame times. */
        long nowNanos();
    }

    // Before two frames have asked the view for a present, no present is late.
    private static final long UNKNOWN_FRAME_INTERVAL_NANOS = Long.MAX_VALUE;

    private final Host mHost;
    private boolean mFrameCallbackPosted = false;
    // Whether the frame callback outstanding retries a frame that is waiting.
    private boolean mRetryPosted = false;
    private boolean mPresentPosted = false;
    // How many vsyncs asked for the posted present, and whether it already
    // went behind a later frame's draw.
    private int mPostedPresentVsyncs = 0;
    private boolean mPostedPresentDeferred = false;
    // The frame time of the last frame that asked for a present, and how long
    // after the one before it that frame came: the vsync interval the view gets.
    private boolean mHasFrameTime = false;
    private long mLastFrameTimeNanos = 0;
    private long mFrameIntervalNanos = UNKNOWN_FRAME_INTERVAL_NANOS;

    FrameScheduler(Host host) {
        mHost = host;
    }

    /** A recording was submitted. Without a backing view there is no surface to present on yet. */
    void requestFrame(@Nullable BackingViewKind kind) {
        if (kind == null) {
            return;
        }
        // A retry still outstanding presents the new recording along with the
        // leftovers on that vsync.
        if (mRetryPosted) {
            return;
        }
        if (presentsOnVsync(kind)) {
            postFrameCallback();
        } else {
            postBehindPendingDraw(0);
        }
    }

    /** The Choreographer frame asked for with Host.postFrameCallback(), at frameTimeNanos. */
    void onFrame(@Nullable BackingViewKind kind, long frameTimeNanos) {
        mFrameCallbackPosted = false;
        mRetryPosted = false;
        if (mHasFrameTime) {
            mFrameIntervalNanos = frameTimeNanos - mLastFrameTimeNanos;
        }
        mHasFrameTime = true;
        mLastFrameTimeNanos = frameTimeNanos;
        if (kind == null) {
            return;
        }
        if (presentsOnVsync(kind)) {
            present(1);
        } else {
            postBehindPendingDraw(1);
        }
    }

    /** The message posted with Host.postBehindPendingDraw(). */
    void onPosted() {
        mPresentPosted = false;
        if (mPostedPresentVsyncs > 0 && !mPostedPresentDeferred && isNextVsyncDue()) {
            // The window's next frame waits behind this message: the present
            // goes behind that frame's draw, which asks for a present too.
            mPostedPresentDeferred = true;
            postFrameCallback();
            postBehindPendingDraw(0);
            return;
        }
        int vsyncs = mPostedPresentVsyncs;
        mPostedPresentVsyncs = 0;
        mPostedPresentDeferred = false;
        present(vsyncs);
    }

    /** The view left its window, and the host removed both callbacks. */
    void cancel() {
        mFrameCallbackPosted = false;
        mRetryPosted = false;
        mPresentPosted = false;
        mPostedPresentVsyncs = 0;
        mPostedPresentDeferred = false;
        mHasFrameTime = false;
        mFrameIntervalNanos = UNKNOWN_FRAME_INTERVAL_NANOS;
    }

    // The compositor takes a SurfaceView's buffer at the vsync. A TextureView's frame
    // shows when its window draws, and its buffer queue replaces a frame not drawn yet.
    private static boolean presentsOnVsync(BackingViewKind kind) {
        return switch (kind) {
            case SURFACE_VIEW -> true;
            case TEXTURE_VIEW -> false;
        };
    }

    // The vsync after the one that last asked for the posted present has come.
    private boolean isNextVsyncDue() {
        return mHost.nowNanos() - mLastFrameTimeNanos >= mFrameIntervalNanos;
    }

    // A frame still waiting (the present failed, or more were submitted
    // meanwhile) is tried again on the next vsync, never straight away; a frame
    // coming keeps the vsync asked for.
    private void present(int vsyncs) {
        switch (mHost.presentFrame(vsyncs)) {
            case NONE -> mRetryPosted = false;
            case WAITING -> {
                mRetryPosted = true;
                postFrameCallback();
            }
            case COMING -> {
                mRetryPosted = false;
                postFrameCallback();
            }
        }
    }

    private void postFrameCallback() {
        if (!mFrameCallbackPosted) {
            mFrameCallbackPosted = true;
            mHost.postFrameCallback();
        }
    }

    private void postBehindPendingDraw(int vsyncs) {
        mPostedPresentVsyncs += vsyncs;
        if (!mPresentPosted) {
            mPresentPosted = true;
            mHost.postBehindPendingDraw();
        }
    }
}
