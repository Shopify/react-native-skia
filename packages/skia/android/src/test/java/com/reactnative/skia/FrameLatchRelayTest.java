package com.reactnative.skia;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

import org.junit.Test;

/**
 * A TextureView canvas presenting from the present thread, against the
 * TextureView's buffer queue as Android runs it: a frame queued while the
 * window has yet to take the one before it replaces that one, and the queue
 * reports no new frame for it, so the window draws nothing for it. The window
 * reports a drawn frame (onSurfaceTextureUpdated) while it records the draw,
 * and its RenderThread takes the buffer in the draw's sync, after that; the
 * present thread runs alongside.
 */
public class FrameLatchRelayTest {
    private static final int FRAMES = 3;
    private static final int DEPTH = 16;

    private enum Step { MAIN, PRESENT }

    /** One run of the pipeline, from the first present. */
    private static final class Pipeline implements FrameLatchRelay.Host {
        private final Deque<Runnable> mMainMessages = new ArrayDeque<>();
        private final Deque<Runnable> mPresentMessages = new ArrayDeque<>();
        private final FrameLatchRelay mRelay = new FrameLatchRelay(this);

        // The TextureView's buffer queue: the frame waiting for the window.
        private Integer mQueuedFrame = null;
        int replacedFrames = 0;
        int takenFrames = 0;

        // The window: a drawn frame to report, a draw posted, and a draw that
        // recorded its frame and has yet to sync.
        private boolean mUpdatePending = false;
        private boolean mDrawPosted = false;
        private boolean mDrawAwaitingSync = false;

        // The present thread's canvas: the latch gate and its frames.
        int presentedFrames = 0;
        int latches = 0;
        boolean latchPending = false;

        Pipeline() {
            mPresentMessages.addLast(this::presentNextFrame);
        }

        @Override
        public void postBehindDraw(Runnable task) {
            mMainMessages.addLast(task);
        }

        @Override
        public void postToPresentThread(Runnable task) {
            mPresentMessages.addLast(task);
        }

        @Override
        public void frameLatched() {
            latches++;
            latchPending = false;
            presentNextFrame();
        }

        private void presentNextFrame() {
            if (latchPending || presentedFrames == FRAMES) {
                return;
            }
            presentedFrames++;
            latchPending = true;
            if (mQueuedFrame != null) {
                replacedFrames++;
                mQueuedFrame = presentedFrames;
                return;
            }
            mQueuedFrame = presentedFrames;
            mMainMessages.addLast(this::frameAvailable);
        }

        private void frameAvailable() {
            mUpdatePending = true;
            if (!mDrawPosted) {
                mDrawPosted = true;
                mMainMessages.addLast(this::recordDraw);
            }
        }

        private void recordDraw() {
            mDrawPosted = false;
            mDrawAwaitingSync = true;
            if (mUpdatePending) {
                mUpdatePending = false;
                mRelay.onWindowDrewFrame();
            }
        }

        private void syncDraw() {
            mDrawAwaitingSync = false;
            if (mQueuedFrame != null) {
                mQueuedFrame = null;
                takenFrames++;
            }
        }

        /** Runs one step of the thread; returns whether it had one to run. */
        boolean run(Step step) {
            switch (step) {
                case MAIN:
                    if (mDrawAwaitingSync) {
                        syncDraw();
                        return true;
                    }
                    return runNext(mMainMessages);
                case PRESENT:
                    return runNext(mPresentMessages);
            }
            throw new IllegalArgumentException("Unknown step " + step);
        }

        /** Runs both threads until neither has a step left. */
        void settle() {
            boolean ran;
            do {
                ran = run(Step.MAIN);
                ran = run(Step.PRESENT) || ran;
            } while (ran);
        }

        private static boolean runNext(Deque<Runnable> messages) {
            Runnable message = messages.pollFirst();
            if (message == null) {
                return false;
            }
            message.run();
            return true;
        }
    }

    private static Pipeline pipelineAfter(List<Step> steps) {
        Pipeline pipeline = new Pipeline();
        for (Step step : steps) {
            if (!pipeline.run(step)) {
                return null;
            }
        }
        return pipeline;
    }

    private interface Check {
        void accept(List<Step> steps, Pipeline pipeline);
    }

    /** Every order of the two threads' steps up to DEPTH: check runs after each. */
    private static void forEachInterleaving(Check check) {
        forEachInterleaving(new ArrayList<>(), check);
    }

    private static void forEachInterleaving(List<Step> steps, Check check) {
        if (steps.size() == DEPTH) {
            return;
        }
        for (Step step : Step.values()) {
            steps.add(step);
            Pipeline pipeline = pipelineAfter(steps);
            if (pipeline != null) {
                check.accept(steps, pipeline);
                forEachInterleaving(steps, check);
            }
            steps.remove(steps.size() - 1);
        }
    }

    @Test
    public void neverReplacesAFrameTheWindowHasYetToTakeInEveryInterleaving() {
        forEachInterleaving((steps, pipeline) ->
                assertEquals("frames replaced after " + steps, 0, pipeline.replacedFrames));
    }

    @Test
    public void latchesEveryFrameItPresentsInEveryInterleaving() {
        forEachInterleaving((steps, pipeline) -> {
            pipeline.settle();
            assertEquals("frames presented after " + steps, FRAMES, pipeline.presentedFrames);
            assertEquals("latches after " + steps, FRAMES, pipeline.latches);
            assertEquals("frames the window took after " + steps, FRAMES, pipeline.takenFrames);
        });
    }

    @Test
    public void handsTheLatchOverOnlyOnceTheWindowsDrawIsDone() {
        Pipeline pipeline = new Pipeline();
        assertTrue(pipeline.run(Step.PRESENT));
        assertTrue(pipeline.run(Step.MAIN));
        assertTrue(pipeline.run(Step.MAIN));
        assertEquals(1, pipeline.presentedFrames);
        assertTrue(pipeline.latchPending);
        assertFalse(pipeline.run(Step.PRESENT));
        assertTrue(pipeline.run(Step.MAIN));
        assertEquals(1, pipeline.takenFrames);
        assertTrue(pipeline.run(Step.MAIN));
        assertTrue(pipeline.run(Step.PRESENT));
        assertEquals(1, pipeline.latches);
        assertEquals(2, pipeline.presentedFrames);
    }
}
