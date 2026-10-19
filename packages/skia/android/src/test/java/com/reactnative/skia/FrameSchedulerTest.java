package com.reactnative.skia;

import static org.junit.Assert.assertEquals;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;

import org.junit.Test;

public class FrameSchedulerTest {
    private enum Call {
        POST_FRAME_CALLBACK,
        POST_BEHIND_PENDING_DRAW,
        PRESENT_ON_VSYNC,
        PRESENT_ON_TWO_VSYNCS,
        PRESENT_ON_REQUEST
    }

    private static final long FRAME_INTERVAL_NANOS = 16_666_667;

    private static final class RecordingHost implements FrameScheduler.Host {
        final List<Call> calls = new ArrayList<>();
        final Deque<FrameScheduler.NextFrame> nextFrames = new ArrayDeque<>();
        long nowNanos = 0;

        @Override
        public void postFrameCallback() {
            calls.add(Call.POST_FRAME_CALLBACK);
        }

        @Override
        public void postBehindPendingDraw() {
            calls.add(Call.POST_BEHIND_PENDING_DRAW);
        }

        @Override
        public FrameScheduler.NextFrame presentFrame(int vsyncs) {
            calls.add(switch (vsyncs) {
                case 0 -> Call.PRESENT_ON_REQUEST;
                case 1 -> Call.PRESENT_ON_VSYNC;
                case 2 -> Call.PRESENT_ON_TWO_VSYNCS;
                default -> throw new AssertionError("presented for " + vsyncs + " vsyncs");
            });
            return nextFrames.isEmpty() ? FrameScheduler.NextFrame.NONE : nextFrames.removeFirst();
        }

        @Override
        public long nowNanos() {
            return nowNanos;
        }

        List<Call> takeCalls() {
            List<Call> taken = new ArrayList<>(calls);
            calls.clear();
            return taken;
        }
    }

    private final RecordingHost mHost = new RecordingHost();
    private final FrameScheduler mScheduler = new FrameScheduler(mHost);

    // A Choreographer frame whose vsync is now.
    private void frame(BackingViewKind kind) {
        mScheduler.onFrame(kind, mHost.nowNanos);
    }

    // Two frames a vsync apart ask a TextureView for presents, the second's
    // still posted: the view has seen its vsync interval.
    private void tickTwice() {
        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.takeCalls();
    }

    @Test
    public void surfaceViewFrameIsPresentedOnTheNextVsync() {
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        assertEquals(Arrays.asList(Call.POST_FRAME_CALLBACK), mHost.takeCalls());

        frame(BackingViewKind.SURFACE_VIEW);
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewFrameIsPresentedBehindThePendingDraw() {
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW), mHost.takeCalls());

        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_REQUEST), mHost.takeCalls());
    }

    @Test
    public void textureViewIsNeverPresentedInsideAChoreographerFrame() {
        frame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW), mHost.takeCalls());

        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewLeftoverIsPresentedBehindTheDrawOfTheNextVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_REQUEST, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestWhileARetryIsOutstandingWaitsForThatVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_REQUEST, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(), mHost.takeCalls());

        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestWhileAFrameIsComingIsPresentedBehindThePendingDraw() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_REQUEST, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_REQUEST), mHost.takeCalls());

        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestAndVsyncWaitingForTheSameDrawPresentOnceForTheVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestBehindTheVsyncsPostedPresentLeavesItTheVsyncs() {
        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void aRetryEndsWithItsVsyncEvenWithoutABackingView() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        frame(null);
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW), mHost.takeCalls());
    }

    @Test
    public void aFrameComingKeepsTheVsyncTicking() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        assertEquals(
                Arrays.asList(
                        Call.POST_FRAME_CALLBACK,
                        Call.PRESENT_ON_VSYNC,
                        Call.POST_FRAME_CALLBACK,
                        Call.PRESENT_ON_VSYNC,
                        Call.POST_FRAME_CALLBACK,
                        Call.PRESENT_ON_VSYNC),
                mHost.takeCalls());
    }

    @Test
    public void surfaceViewLeftoverIsPresentedOnTheNextVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        assertEquals(
                Arrays.asList(Call.POST_FRAME_CALLBACK, Call.PRESENT_ON_VSYNC, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        frame(BackingViewKind.SURFACE_VIEW);
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void requestsWaitingForTheSameFrameArePostedOnce() {
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(
                Arrays.asList(Call.POST_FRAME_CALLBACK, Call.PRESENT_ON_VSYNC, Call.POST_BEHIND_PENDING_DRAW),
                mHost.takeCalls());
    }

    @Test
    public void requestAfterTheFrameRanIsPostedAgain() {
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        frame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(
                Arrays.asList(
                        Call.POST_FRAME_CALLBACK,
                        Call.PRESENT_ON_VSYNC,
                        Call.POST_FRAME_CALLBACK,
                        Call.PRESENT_ON_VSYNC,
                        Call.POST_BEHIND_PENDING_DRAW,
                        Call.PRESENT_ON_REQUEST,
                        Call.POST_BEHIND_PENDING_DRAW),
                mHost.takeCalls());
    }

    @Test
    public void withoutABackingViewNothingIsPostedOrPresented() {
        mScheduler.requestFrame(null);
        frame(null);
        assertEquals(Arrays.asList(), mHost.takeCalls());
    }

    @Test
    public void cancelDropsOutstandingRequests() {
        for (BackingViewKind kind : BackingViewKind.values()) {
            mScheduler.requestFrame(kind);
            mScheduler.cancel();
            mScheduler.requestFrame(kind);
            mScheduler.cancel();
        }
        assertEquals(
                Arrays.asList(
                        Call.POST_FRAME_CALLBACK,
                        Call.POST_FRAME_CALLBACK,
                        Call.POST_BEHIND_PENDING_DRAW,
                        Call.POST_BEHIND_PENDING_DRAW),
                mHost.takeCalls());
    }

    @Test
    public void textureViewVsyncPresentReachedBeforeTheNextVsyncIsPresentedAtOnce() {
        tickTwice();
        mHost.nowNanos += FRAME_INTERVAL_NANOS - 1;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewVsyncPresentReachedOnceTheNextVsyncCameGoesBehindThatFramesDraw() {
        tickTwice();
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_FRAME_CALLBACK, Call.POST_BEHIND_PENDING_DRAW), mHost.takeCalls());

        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_TWO_VSYNCS), mHost.takeCalls());
    }

    @Test
    public void aDeferredPresentIsPresentedOnItsNextTurnHoweverLate() {
        tickTwice();
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        mHost.takeCalls();

        mHost.nowNanos += 3 * FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void aVsyncPresentIsNeverLateBeforeTwoFramesShowedTheInterval() {
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += 10 * FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void framesAnIdleGapApartShowNoShorterInterval() {
        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mHost.nowNanos += 100 * FRAME_INTERVAL_NANOS;
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC, Call.POST_BEHIND_PENDING_DRAW,
                        Call.PRESENT_ON_VSYNC),
                mHost.takeCalls());
    }

    @Test
    public void aSubmittedRecordingsPresentIsNeverDeferred() {
        tickTwice();
        mScheduler.onPosted();
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += 10 * FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_REQUEST), mHost.takeCalls());
    }

    @Test
    public void everyVsyncBeforeItsPresentCountsForIt() {
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_TWO_VSYNCS), mHost.takeCalls());
    }

    @Test
    public void cancelForgetsADeferredPresent() {
        tickTwice();
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        mScheduler.cancel();
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_REQUEST), mHost.takeCalls());
    }

    @Test
    public void aDeferralIsForOnePresentOnly() {
        tickTwice();
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        frame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mHost.takeCalls();

        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.POST_FRAME_CALLBACK, Call.POST_BEHIND_PENDING_DRAW),
                mHost.takeCalls());
    }

    @Test
    public void cancelForgetsThatAPresentWasDeferred() {
        tickTwice();
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        mScheduler.cancel();
        mHost.takeCalls();

        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.POST_FRAME_CALLBACK, Call.POST_BEHIND_PENDING_DRAW),
                mHost.takeCalls());
    }

    @Test
    public void cancelForgetsTheLastFrame() {
        tickTwice();
        mScheduler.cancel();
        mHost.nowNanos += FRAME_INTERVAL_NANOS / 2;
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS / 2;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void cancelForgetsTheInterval() {
        tickTwice();
        mScheduler.cancel();
        frame(BackingViewKind.TEXTURE_VIEW);
        mHost.nowNanos += FRAME_INTERVAL_NANOS;
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void nativeValuesNameTheirNextFrame() {
        assertEquals(FrameScheduler.NextFrame.NONE, FrameScheduler.NextFrame.fromNative(0));
        assertEquals(FrameScheduler.NextFrame.WAITING, FrameScheduler.NextFrame.fromNative(1));
        assertEquals(FrameScheduler.NextFrame.COMING, FrameScheduler.NextFrame.fromNative(2));
    }
}
