package com.reactnative.skia;

import androidx.annotation.Nullable;

/**
 * Decides when a SkiaView presents the recordings queued for it: a SurfaceView
 * on the next vsync, a TextureView as soon as the present thread gets to it,
 * its frame held until its window has drawn the previous one (see
 * JniSkiaView::frameLatched), and presented the moment the window has. While a
 * replay is in flight it asks for every vsync, whose present paces the
 * replays, and it tells each present how many vsyncs asked for it, each a tick
 * (see RNSkView::presentFrame). Keeps at most one frame callback and one posted
 * present outstanding. Present thread (see PresentThread).
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

        /** Calls onPosted() from the present thread's looper. */
        void postPresent();

        /**
         * Presents what is waiting. vsyncs is how many vsyncs asked for this
         * present: none for the one a submitted recording asked for.
         */
        NextFrame presentFrame(int vsyncs);
    }

    private final Host mHost;
    private boolean mFrameCallbackPosted = false;
    // Whether the frame callback outstanding retries a frame that is waiting.
    private boolean mRetryPosted = false;
    private boolean mPresentPosted = false;
    // How many vsyncs asked for the posted present.
    private int mPostedPresentVsyncs = 0;

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
            postPresent(0);
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
            present(1);
        } else {
            postPresent(1);
        }
    }

    /**
     * The window took the frame presented last (see FrameLatchRelay): the
     * frame held for it presents now rather than at the retry outstanding,
     * which would race the next vsync's draw and start the next replay later.
     */
    void onFrameLatched() {
        present(0);
    }

    /** The message posted with Host.postPresent(). */
    void onPosted() {
        mPresentPosted = false;
        int vsyncs = mPostedPresentVsyncs;
        mPostedPresentVsyncs = 0;
        present(vsyncs);
    }

    /** The view left its window, and the host removed both callbacks. */
    void cancel() {
        mFrameCallbackPosted = false;
        mRetryPosted = false;
        mPresentPosted = false;
        mPostedPresentVsyncs = 0;
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

    private void postPresent(int vsyncs) {
        mPostedPresentVsyncs += vsyncs;
        if (!mPresentPosted) {
            mPresentPosted = true;
            mHost.postPresent();
        }
    }
}
