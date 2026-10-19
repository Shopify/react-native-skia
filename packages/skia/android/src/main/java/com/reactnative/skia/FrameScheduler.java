package com.reactnative.skia;

import androidx.annotation.Nullable;

/**
 * Decides when a SkiaView presents the recordings queued for it: a SurfaceView
 * on the next vsync, a TextureView behind the draw its window has pending, so
 * that the window has taken the previous frame by then. While a replay is in
 * flight it asks for every vsync, whose present paces the replays. Keeps at
 * most one frame callback and one posted present outstanding. Main thread.
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
         * Presents what is waiting. onVsync tells the present a vsync asked for
         * from one a submitted recording asked for.
         */
        NextFrame presentFrame(boolean onVsync);
    }

    private final Host mHost;
    private boolean mFrameCallbackPosted = false;
    // Whether the frame callback outstanding retries a frame that is waiting.
    private boolean mRetryPosted = false;
    private boolean mPresentPosted = false;
    // Whether the posted present is the one a vsync asked for.
    private boolean mPostedPresentOnVsync = false;

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
            postBehindPendingDraw(false);
        }
    }

    /** The Choreographer frame asked for with Host.postFrameCallback(). */
    void onFrame(@Nullable BackingViewKind kind) {
        mFrameCallbackPosted = false;
        mRetryPosted = false;
        if (kind == null) {
            return;
        }
        if (presentsOnVsync(kind)) {
            present(true);
        } else {
            postBehindPendingDraw(true);
        }
    }

    /** The message posted with Host.postBehindPendingDraw(). */
    void onPosted() {
        mPresentPosted = false;
        boolean onVsync = mPostedPresentOnVsync;
        mPostedPresentOnVsync = false;
        present(onVsync);
    }

    /** The view left its window, and the host removed both callbacks. */
    void cancel() {
        mFrameCallbackPosted = false;
        mRetryPosted = false;
        mPresentPosted = false;
        mPostedPresentOnVsync = false;
    }

    // The compositor takes a SurfaceView's buffer at the vsync. A TextureView's frame
    // shows when its window draws, and its buffer queue replaces a frame not drawn yet.
    private static boolean presentsOnVsync(BackingViewKind kind) {
        return switch (kind) {
            case SURFACE_VIEW -> true;
            case TEXTURE_VIEW -> false;
        };
    }

    // A frame still waiting (the present failed, or more were submitted
    // meanwhile) is tried again on the next vsync, never straight away; a frame
    // coming keeps the vsync asked for.
    private void present(boolean onVsync) {
        switch (mHost.presentFrame(onVsync)) {
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

    private void postBehindPendingDraw(boolean onVsync) {
        mPostedPresentOnVsync = mPostedPresentOnVsync || onVsync;
        if (!mPresentPosted) {
            mPresentPosted = true;
            mHost.postBehindPendingDraw();
        }
    }
}
