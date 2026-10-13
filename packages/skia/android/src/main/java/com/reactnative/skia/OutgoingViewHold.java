package com.reactnative.skia;

import android.os.Build;

import androidx.annotation.Nullable;

/**
 * Keeps the view a SkiaView replaced on screen until the new one shows the
 * canvas: the outgoing view stays above the new one until the new view is in
 * the window (see Arrival) and a window frame drawn after that has
 * committed, so the new view is on screen beneath it before it leaves. A
 * new view that is not in the window within FirstFrameDrawGate's wait is not
 * waited for, as the window does not wait for its first frame either.
 * Another swap, or the SkiaView leaving its window, removes the view at once.
 * Main thread.
 */
final class OutgoingViewHold<V> {
    /** What puts a new SurfaceView in the window. */
    enum Arrival {
        /** Its first frame, which the window shows once the frame is reported drawn. */
        FIRST_FRAME,
        /**
         * Its first frame and then its hole, which the window opens in a
         * message posted after the frame is reported drawn: Android 13's
         * SurfaceView completes the report through SurfaceSyncer.setupSync(Runnable),
         * which posts it, so the window frames drawn in between have no hole.
         */
        HOLE_AFTER_FIRST_FRAME;

        /** How a SurfaceView above or behind the window reaches it on sdkInt. */
        static Arrival ofSurfaceView(int sdkInt, boolean zOrderOnTop) {
            return sdkInt == Build.VERSION_CODES.TIRAMISU && !zOrderOnTop ? HOLE_AFTER_FIRST_FRAME : FIRST_FRAME;
        }
    }

    /** What the hold asks of the view that owns it. */
    interface Host<V> {
        /** Removes a held view from the hierarchy. */
        void removeView(V view);

        /** Runs action once a window frame drawn after this call has committed. */
        void runAfterWindowFrameCommits(Runnable action);

        /** Runs action on the main thread after delayMillis, unless removed. */
        void postDelayed(Runnable action, long delayMillis);

        /** Removes an action posted with postDelayed. */
        void removeCallbacks(Runnable action);
    }

    /** What the held view waits for next. */
    private enum Wait {
        FIRST_FRAME,
        HOLE,
        WINDOW_FRAME,
    }

    private final Host<V> mHost;
    private final Runnable mArrivalDeadline = this::release;
    @Nullable
    private V mHeld;
    private Arrival mArrival = Arrival.FIRST_FRAME;
    private Wait mWait = Wait.FIRST_FRAME;

    OutgoingViewHold(Host<V> host) {
        mHost = host;
    }

    /** The held view, laid out with the canvas while it stays; null when none is held. */
    @Nullable
    V held() {
        return mHeld;
    }

    /** Holds view until a new view arriving as arrival is in the window, removing the one held before it. */
    void hold(V view, Arrival arrival) {
        release();
        mHeld = view;
        mArrival = arrival;
        mWait = Wait.FIRST_FRAME;
        mHost.postDelayed(mArrivalDeadline, FirstFrameDrawGate.FIRST_FRAME_WAIT_MILLIS);
    }

    /** Removes the held view now. */
    void release() {
        if (mHeld == null) {
            return;
        }
        V view = mHeld;
        mHeld = null;
        mHost.removeCallbacks(mArrivalDeadline);
        mHost.removeView(view);
    }

    /** The new view presented its first frame. */
    void onFirstFramePresented() {
        if (mHeld == null || mWait != Wait.FIRST_FRAME) {
            return;
        }
        switch (mArrival) {
            case FIRST_FRAME -> leaveAfterWindowFrame();
            case HOLE_AFTER_FIRST_FRAME -> mWait = Wait.HOLE;
        }
    }

    /**
     * The new view asked for the window's transparent region, which a
     * SurfaceView does as it attaches and, from Android 11, as it opens its hole.
     */
    void onTransparentRegionRequested() {
        if (mHeld == null || mWait != Wait.HOLE) {
            return;
        }
        leaveAfterWindowFrame();
    }

    private void leaveAfterWindowFrame() {
        mWait = Wait.WINDOW_FRAME;
        mHost.removeCallbacks(mArrivalDeadline);
        V view = mHeld;
        mHost.runAfterWindowFrameCommits(() -> {
            if (mHeld == view) {
                release();
            }
        });
    }
}
