package com.reactnative.skia;

import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.os.Process;

import java.util.concurrent.CountDownLatch;

/**
 * The thread every SkiaView presents on, one for the process: it owns each
 * view's window surface (attach, resize, detach), runs its FrameScheduler on a
 * Choreographer of its own, and replays and presents its recordings. The main
 * thread only relays the backing views' callbacks to it, so that no present
 * takes the window's frames from the main thread. One thread for every view
 * keeps their submissions to the GPU in one order, which the Graphite context
 * serializes anyway.
 */
final class PresentThread {
    private static final Handler HANDLER = createHandler();

    private PresentThread() {}

    private static Handler createHandler() {
        HandlerThread thread = new HandlerThread("RNSkia Present", Process.THREAD_PRIORITY_URGENT_DISPLAY);
        thread.start();
        return new Handler(thread.getLooper());
    }

    /** Whether the calling thread is the present thread. */
    static boolean isCurrent() {
        return Looper.myLooper() == HANDLER.getLooper();
    }

    /** Runs the task on the present thread, after the ones posted before it. */
    static void post(Runnable task) {
        HANDLER.post(task);
    }

    /** Removes a task posted with post() that has not run yet. */
    static void remove(Runnable task) {
        HANDLER.removeCallbacks(task);
    }

    /**
     * Runs the task on the present thread and returns once it has run, after
     * the ones posted before it. A backing view's surface must not be touched
     * once its destroyed callback returns, so that callback waits here.
     */
    static void runAndWait(Runnable task) {
        if (isCurrent()) {
            task.run();
            return;
        }
        CountDownLatch done = new CountDownLatch(1);
        HANDLER.post(() -> {
            try {
                task.run();
            } finally {
                done.countDown();
            }
        });
        boolean interrupted = false;
        while (true) {
            try {
                done.await();
                break;
            } catch (InterruptedException e) {
                interrupted = true;
            }
        }
        if (interrupted) {
            Thread.currentThread().interrupt();
        }
    }
}
