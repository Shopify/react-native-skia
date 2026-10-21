package com.reactnative.skia;

/**
 * Hands a TextureView's latch to the present thread, which presents the view's
 * next frame only once the window has drawn the last one (see
 * JniSkiaView::frameLatched). The window reports a drawn frame
 * (onSurfaceTextureUpdated) while it records its draw, and its RenderThread
 * takes the buffer in the draw's sync, after that. A frame queued in between
 * replaces the one the window has yet to take, and the TextureView's queue
 * reports no new frame for it, so the window would never draw it and the latch
 * would never come: the present thread hears of the latch once the draw is
 * done.
 */
final class FrameLatchRelay {
    /** What the relay asks of the view. */
    interface Host {
        /** Runs the task on the main thread once the message running now, the window's draw, is done. */
        void postBehindDraw(Runnable task);

        /** Runs the task on the present thread, after the ones posted before it. */
        void postToPresentThread(Runnable task);

        /** The latch, on the present thread. */
        void frameLatched();
    }

    private final Host mHost;
    private final Runnable mRelayToPresentThread;

    FrameLatchRelay(Host host) {
        mHost = host;
        Runnable latch = mHost::frameLatched;
        mRelayToPresentThread = () -> mHost.postToPresentThread(latch);
    }

    /** Main thread: the window drew the TextureView's last frame (onSurfaceTextureUpdated). */
    void onWindowDrewFrame() {
        mHost.postBehindDraw(mRelayToPresentThread);
    }
}
