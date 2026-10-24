package com.reactnative.skia;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;

/**
 * An image and the smaller levels of it views asked for, each half the one before, down to the smallest. The levels
 * are made in batches by jobs on the maker's executor, one batch at a time, and handed to the main executor, where
 * the levels and every request live; a batch makes the levels down to the deepest one asked for when it started, and
 * the next batch goes on from there. A level there is no memory for ends the making for good. Generic over what a
 * level is, so that its sequence runs with stand-ins of its own.
 */
final class ImageLevels<Level> {

    /** What a level is made, measured and readied with, on the maker's executor. */
    interface Halving<Level> {
        /** The level half the size of `level`; throws OutOfMemoryError when there is no memory for it. */
        @NonNull
        Level halve(@NonNull Level level);

        /** Whether `level` is the smallest, which has no level below it. */
        boolean isSmallest(@NonNull Level level);

        /** Readies `level` for drawing ahead of its first draw. */
        void prepare(@NonNull Level level);

        /** There was no memory for the level below `level`. */
        void ranOutOfMemory(@NonNull Level level);
    }

    private final Halving<Level> mHalving;
    private final Executor mMaker;
    private final Executor mMainThread;
    private final Runnable mOnLevelsMade;
    private final List<Level> mLevels = new ArrayList<>();
    private int mDeepestLevelAsked = 0;
    private boolean mMakingLevels = false;
    private boolean mOutOfMemory = false;

    /** `onLevelsMade` runs on the main executor once a batch of levels is made. */
    ImageLevels(@NonNull Level image, @NonNull Halving<Level> halving, @NonNull Executor maker,
            @NonNull Executor mainThread, @NonNull Runnable onLevelsMade) {
        mHalving = halving;
        mMaker = maker;
        mMainThread = mainThread;
        mOnLevelsMade = onLevelsMade;
        mLevels.add(image);
    }

    @NonNull
    Level image() {
        return mLevels.get(0);
    }

    /**
     * What a view drawing the level draws: the level once it is made, or the deepest one made when no deeper one can
     * be; nothing while it is on its way (see request).
     */
    @Nullable
    Level levelToDraw(int level) {
        if (level < mLevels.size()) {
            return mLevels.get(level);
        }
        return mOutOfMemory || mHalving.isSmallest(deepestMade()) ? deepestMade() : null;
    }

    /** Makes the level unless it is made or on its way; onLevelsMade runs once it is made. */
    void request(int level) {
        if (level < mLevels.size() || mOutOfMemory || mHalving.isSmallest(deepestMade())) {
            return;
        }
        mDeepestLevelAsked = Math.max(mDeepestLevelAsked, level);
        if (!mMakingLevels) {
            makeLevels();
        }
    }

    private Level deepestMade() {
        return mLevels.get(mLevels.size() - 1);
    }

    private void makeLevels() {
        mMakingLevels = true;
        final Level from = deepestMade();
        final int count = mDeepestLevelAsked - (mLevels.size() - 1);
        mMaker.execute(() -> {
            List<Level> made = new ArrayList<>(count);
            Level previous = from;
            boolean outOfMemory = false;
            try {
                for (int index = 0; index < count && !mHalving.isSmallest(previous); index++) {
                    previous = mHalving.halve(previous);
                    made.add(previous);
                }
            } catch (OutOfMemoryError error) {
                mHalving.ranOutOfMemory(previous);
                outOfMemory = true;
            }
            if (!made.isEmpty()) {
                // The level the deepest view asked for.
                mHalving.prepare(made.get(made.size() - 1));
            }
            final boolean noMoreLevels = outOfMemory;
            mMainThread.execute(() -> {
                mLevels.addAll(made);
                mMakingLevels = false;
                mOutOfMemory = noMoreLevels;
                if (!mOutOfMemory && mDeepestLevelAsked >= mLevels.size() && !mHalving.isSmallest(deepestMade())) {
                    makeLevels();
                }
                mOnLevelsMade.run();
            });
        });
    }
}
