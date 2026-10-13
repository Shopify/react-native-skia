package com.reactnative.skia;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Test;

public class OutgoingViewHoldTest {
    private static final class RecordingHost implements OutgoingViewHold.Host<String> {
        final List<String> removed = new ArrayList<>();
        final List<Runnable> afterFrameCommit = new ArrayList<>();
        final List<Runnable> delayed = new ArrayList<>();
        final List<Long> delays = new ArrayList<>();

        @Override
        public void removeView(String view) {
            removed.add(view);
        }

        @Override
        public void runAfterWindowFrameCommits(Runnable action) {
            afterFrameCommit.add(action);
        }

        @Override
        public void postDelayed(Runnable action, long delayMillis) {
            delayed.add(action);
            delays.add(delayMillis);
        }

        @Override
        public void removeCallbacks(Runnable action) {
            delayed.remove(action);
        }

        void commitWindowFrame() {
            List<Runnable> pending = new ArrayList<>(afterFrameCommit);
            afterFrameCommit.clear();
            for (Runnable action : pending) {
                action.run();
            }
        }

        void elapse() {
            List<Runnable> due = new ArrayList<>(delayed);
            delayed.clear();
            for (Runnable action : due) {
                action.run();
            }
        }
    }

    private static final OutgoingViewHold.Arrival FIRST_FRAME = OutgoingViewHold.Arrival.FIRST_FRAME;
    private static final OutgoingViewHold.Arrival HOLE_AFTER_FIRST_FRAME = OutgoingViewHold.Arrival.HOLE_AFTER_FIRST_FRAME;

    private final RecordingHost mHost = new RecordingHost();
    private final OutgoingViewHold<String> mHold = new OutgoingViewHold<>(mHost);

    @Test
    public void heldViewLeavesOnceAWindowFrameAfterTheFirstFrameHasCommitted() {
        mHold.hold("texture", FIRST_FRAME);
        mHold.onFirstFramePresented();
        assertEquals(Arrays.asList(), mHost.removed);
        assertSame("texture", mHold.held());

        mHost.commitWindowFrame();
        assertEquals(Arrays.asList("texture"), mHost.removed);
        assertNull(mHold.held());
    }

    @Test
    public void heldViewStaysWhileNoFirstFrameHasBeenPresented() {
        mHold.hold("texture", FIRST_FRAME);
        mHost.commitWindowFrame();
        assertEquals(Arrays.asList(), mHost.removed);
        assertSame("texture", mHold.held());
    }

    @Test
    public void releaseRemovesTheHeldViewAtOnce() {
        mHold.hold("texture", FIRST_FRAME);
        mHold.release();
        assertEquals(Arrays.asList("texture"), mHost.removed);
        assertNull(mHold.held());
    }

    @Test
    public void holdingAnotherViewRemovesTheFirstAtOnce() {
        mHold.hold("first", FIRST_FRAME);
        mHold.hold("second", FIRST_FRAME);
        assertEquals(Arrays.asList("first"), mHost.removed);
        assertSame("second", mHold.held());
    }

    @Test
    public void aCommitScheduledForAReplacedViewLeavesTheNewOneHeld() {
        mHold.hold("first", FIRST_FRAME);
        mHold.onFirstFramePresented();
        mHold.hold("second", FIRST_FRAME);
        mHost.commitWindowFrame();
        assertEquals(Arrays.asList("first"), mHost.removed);
        assertSame("second", mHold.held());
    }

    @Test
    public void eachViewIsRemovedOnce() {
        mHold.hold("texture", FIRST_FRAME);
        mHold.onFirstFramePresented();
        mHold.onFirstFramePresented();
        mHost.commitWindowFrame();
        mHold.release();
        mHost.elapse();
        assertEquals(Arrays.asList("texture"), mHost.removed);
    }

    @Test
    public void nothingHeldMeansNothingScheduledOrRemoved() {
        mHold.onFirstFramePresented();
        mHold.onTransparentRegionRequested();
        mHold.release();
        assertEquals(0, mHost.afterFrameCommit.size());
        assertEquals(0, mHost.delayed.size());
        assertEquals(Arrays.asList(), mHost.removed);
        assertNull(mHold.held());
    }

    @Test
    public void aFirstFrameThatNeverComesIsWaitedForOnlyUntilTheDeadline() {
        mHold.hold("texture", FIRST_FRAME);
        assertEquals(Arrays.asList(Long.valueOf(FirstFrameDrawGate.FIRST_FRAME_WAIT_MILLIS)), mHost.delays);

        mHost.elapse();
        assertEquals(Arrays.asList("texture"), mHost.removed);
        assertNull(mHold.held());
    }

    @Test
    public void theFirstFrameCancelsTheDeadline() {
        mHold.hold("texture", FIRST_FRAME);
        mHold.onFirstFramePresented();
        assertEquals(0, mHost.delayed.size());
    }

    @Test
    public void releasingCancelsTheDeadline() {
        mHold.hold("texture", FIRST_FRAME);
        mHold.release();
        assertEquals(0, mHost.delayed.size());
    }

    @Test
    public void holdingAnotherViewRestartsTheDeadline() {
        mHold.hold("first", FIRST_FRAME);
        mHold.hold("second", FIRST_FRAME);
        assertEquals(1, mHost.delayed.size());
        assertEquals(Arrays.asList("first"), mHost.removed);

        mHost.elapse();
        assertEquals(Arrays.asList("first", "second"), mHost.removed);
    }

    @Test
    public void aTransparentRegionRequestDoesNotMoveAViewArrivingWithItsFirstFrame() {
        mHold.hold("texture", FIRST_FRAME);
        mHold.onTransparentRegionRequested();
        assertEquals(0, mHost.afterFrameCommit.size());

        mHold.onFirstFramePresented();
        mHold.onTransparentRegionRequested();
        assertEquals(1, mHost.afterFrameCommit.size());
    }

    @Test
    public void heldViewWaitingForTheHoleStaysThroughWindowFramesAfterTheFirstFrame() {
        mHold.hold("texture", HOLE_AFTER_FIRST_FRAME);
        mHold.onFirstFramePresented();
        assertEquals(0, mHost.afterFrameCommit.size());

        mHost.commitWindowFrame();
        assertEquals(Arrays.asList(), mHost.removed);
        assertSame("texture", mHold.held());
    }

    @Test
    public void heldViewLeavesOnceAWindowFrameAfterTheHoleHasCommitted() {
        mHold.hold("texture", HOLE_AFTER_FIRST_FRAME);
        mHold.onFirstFramePresented();
        mHold.onTransparentRegionRequested();
        assertEquals(Arrays.asList(), mHost.removed);
        assertEquals(0, mHost.delayed.size());

        mHost.commitWindowFrame();
        assertEquals(Arrays.asList("texture"), mHost.removed);
        assertNull(mHold.held());
    }

    @Test
    public void theRequestAViewMakesAsItAttachesIsNotItsHole() {
        mHold.hold("texture", HOLE_AFTER_FIRST_FRAME);
        mHold.onTransparentRegionRequested();
        mHold.onFirstFramePresented();
        mHost.commitWindowFrame();
        assertEquals(Arrays.asList(), mHost.removed);

        mHold.onTransparentRegionRequested();
        mHost.commitWindowFrame();
        assertEquals(Arrays.asList("texture"), mHost.removed);
    }

    @Test
    public void aHoleThatNeverOpensIsWaitedForOnlyUntilTheDeadline() {
        mHold.hold("texture", HOLE_AFTER_FIRST_FRAME);
        mHold.onFirstFramePresented();
        assertEquals(1, mHost.delayed.size());

        mHost.elapse();
        assertEquals(Arrays.asList("texture"), mHost.removed);
        assertNull(mHold.held());
    }

    @Test
    public void eachHoleIsWaitedOnOnce() {
        mHold.hold("texture", HOLE_AFTER_FIRST_FRAME);
        mHold.onFirstFramePresented();
        mHold.onTransparentRegionRequested();
        mHold.onTransparentRegionRequested();
        assertEquals(1, mHost.afterFrameCommit.size());
    }

    @Test
    public void onlyASurfaceViewBehindTheWindowOnAndroid13WaitsForItsHole() {
        for (int sdkInt = 26; sdkInt <= 37; sdkInt++) {
            OutgoingViewHold.Arrival behindTheWindow = sdkInt == 33 ? HOLE_AFTER_FIRST_FRAME : FIRST_FRAME;
            assertEquals("API " + sdkInt, behindTheWindow, OutgoingViewHold.Arrival.ofSurfaceView(sdkInt, false));
            assertEquals("API " + sdkInt, FIRST_FRAME, OutgoingViewHold.Arrival.ofSurfaceView(sdkInt, true));
        }
    }
}
