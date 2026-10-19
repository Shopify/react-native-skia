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
        PRESENT_ON_REQUEST
    }

    private static final class RecordingHost implements FrameScheduler.Host {
        final List<Call> calls = new ArrayList<>();
        final Deque<FrameScheduler.NextFrame> nextFrames = new ArrayDeque<>();

        @Override
        public void postFrameCallback() {
            calls.add(Call.POST_FRAME_CALLBACK);
        }

        @Override
        public void postBehindPendingDraw() {
            calls.add(Call.POST_BEHIND_PENDING_DRAW);
        }

        @Override
        public FrameScheduler.NextFrame presentFrame(boolean onVsync) {
            calls.add(onVsync ? Call.PRESENT_ON_VSYNC : Call.PRESENT_ON_REQUEST);
            return nextFrames.isEmpty() ? FrameScheduler.NextFrame.NONE : nextFrames.removeFirst();
        }

        List<Call> takeCalls() {
            List<Call> taken = new ArrayList<>(calls);
            calls.clear();
            return taken;
        }
    }

    private final RecordingHost mHost = new RecordingHost();
    private final FrameScheduler mScheduler = new FrameScheduler(mHost);

    @Test
    public void surfaceViewFrameIsPresentedOnTheNextVsync() {
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        assertEquals(Arrays.asList(Call.POST_FRAME_CALLBACK), mHost.takeCalls());

        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
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
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
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

        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
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

        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
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

        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
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
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestBehindTheVsyncsPostedPresentLeavesItTheVsyncs() {
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void aRetryEndsWithItsVsyncEvenWithoutABackingView() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mScheduler.onFrame(null);
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_BEHIND_PENDING_DRAW), mHost.takeCalls());
    }

    @Test
    public void aFrameComingKeepsTheVsyncTicking() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
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
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
        assertEquals(
                Arrays.asList(Call.POST_FRAME_CALLBACK, Call.PRESENT_ON_VSYNC, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void requestsWaitingForTheSameFrameArePostedOnce() {
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(
                Arrays.asList(Call.POST_FRAME_CALLBACK, Call.PRESENT_ON_VSYNC, Call.POST_BEHIND_PENDING_DRAW),
                mHost.takeCalls());
    }

    @Test
    public void requestAfterTheFrameRanIsPostedAgain() {
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.requestFrame(BackingViewKind.SURFACE_VIEW);
        mScheduler.onFrame(BackingViewKind.SURFACE_VIEW);
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
        mScheduler.onFrame(null);
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
    public void nativeValuesNameTheirNextFrame() {
        assertEquals(FrameScheduler.NextFrame.NONE, FrameScheduler.NextFrame.fromNative(0));
        assertEquals(FrameScheduler.NextFrame.WAITING, FrameScheduler.NextFrame.fromNative(1));
        assertEquals(FrameScheduler.NextFrame.COMING, FrameScheduler.NextFrame.fromNative(2));
    }
}
