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
        POST_PRESENT,
        PRESENT_ON_VSYNC,
        PRESENT_ON_TWO_VSYNCS,
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
        public void postPresent() {
            calls.add(Call.POST_PRESENT);
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
    public void textureViewFrameIsPresentedByAPostedMessage() {
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_PRESENT), mHost.takeCalls());

        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_REQUEST), mHost.takeCalls());
    }

    @Test
    public void textureViewIsNeverPresentedInsideAChoreographerFrame() {
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_PRESENT), mHost.takeCalls());

        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewLeftoverIsPresentedByTheMessageOfTheNextVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_REQUEST, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestWhileARetryIsOutstandingWaitsForThatVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_REQUEST, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(), mHost.takeCalls());

        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestWhileAFrameIsComingIsPresentedByAPostedMessage() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(
                Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_REQUEST, Call.POST_FRAME_CALLBACK),
                mHost.takeCalls());

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_REQUEST), mHost.takeCalls());

        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestAndVsyncWaitingForTheSameMessagePresentOnceForTheVsync() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.COMING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void textureViewRequestBehindTheVsyncsPostedPresentLeavesItTheVsyncs() {
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_VSYNC), mHost.takeCalls());
    }

    @Test
    public void aRetryEndsWithItsVsyncEvenWithoutABackingView() {
        mHost.nextFrames.add(FrameScheduler.NextFrame.WAITING);
        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        mScheduler.onFrame(null);
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        assertEquals(Arrays.asList(Call.POST_PRESENT), mHost.takeCalls());
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
                Arrays.asList(Call.POST_FRAME_CALLBACK, Call.PRESENT_ON_VSYNC, Call.POST_PRESENT),
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
                        Call.POST_PRESENT,
                        Call.PRESENT_ON_REQUEST,
                        Call.POST_PRESENT),
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
                        Call.POST_PRESENT,
                        Call.POST_PRESENT),
                mHost.takeCalls());
    }

    @Test
    public void everyVsyncBeforeItsPresentCountsForIt() {
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_TWO_VSYNCS), mHost.takeCalls());
    }

    @Test
    public void cancelForgetsTheVsyncsOfThePostedPresent() {
        mScheduler.onFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.cancel();
        mHost.takeCalls();

        mScheduler.requestFrame(BackingViewKind.TEXTURE_VIEW);
        mScheduler.onPosted();
        assertEquals(Arrays.asList(Call.POST_PRESENT, Call.PRESENT_ON_REQUEST), mHost.takeCalls());
    }

    @Test
    public void nativeValuesNameTheirNextFrame() {
        assertEquals(FrameScheduler.NextFrame.NONE, FrameScheduler.NextFrame.fromNative(0));
        assertEquals(FrameScheduler.NextFrame.WAITING, FrameScheduler.NextFrame.fromNative(1));
        assertEquals(FrameScheduler.NextFrame.COMING, FrameScheduler.NextFrame.fromNative(2));
    }
}
