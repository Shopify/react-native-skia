package com.reactnative.skia;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * An image's bitmap and the smaller levels of it that views drawing it smaller asked for, each half the one before
 * on every side, down to a pixel (see ImageLevels). Android's renderer samples a bitmap without mipmaps, however the
 * bitmap is marked (its Paint's sampling has no mipmap mode:
 * https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/libs/hwui/hwui/Paint.h), so a view
 * draws the first level it minifies less than twofold (see levelFor), as a GPU's mipmaps would: one image minified
 * many times over aliases. Levels are made off the main thread, one batch at a time, and every view of the image
 * shares them. Main thread.
 */
final class PresentedImage {

    private static final String TAG = "PresentedImage";

    private static final Executor sLevelMaker = Executors.newSingleThreadExecutor(job -> {
        Thread thread = new Thread(job, "RNSkia Levels");
        thread.setDaemon(true);
        return thread;
    });

    private static final ImageLevels.Halving<Bitmap> sBitmapHalving = new ImageLevels.Halving<Bitmap>() {
        private final Paint mPaint = new Paint(Paint.FILTER_BITMAP_FLAG);

        // A box filter: each pixel of the half-size level is the mean of the two by two block it covers, which the
        // bilinear sample at its center reads at exactly half the scale. An odd side's last row or column is left
        // out: createScaledBitmap would scale it by (n / 2) / n, moving the samples off the blocks' corners onto
        // pixel centers, which point-samples the middle of that side.
        @NonNull
        @Override
        public Bitmap halve(@NonNull Bitmap bitmap) {
            int width = bitmap.getWidth();
            int height = bitmap.getHeight();
            Bitmap half = Bitmap.createBitmap(Math.max(1, width / 2), Math.max(1, height / 2),
                    Bitmap.Config.ARGB_8888);
            RectF destination = new RectF(0, 0, width > 1 ? width / 2f : 1, height > 1 ? height / 2f : 1);
            new Canvas(half).drawBitmap(bitmap, null, destination, mPaint);
            return half;
        }

        @Override
        public boolean isSmallest(@NonNull Bitmap bitmap) {
            return bitmap.getWidth() == 1 && bitmap.getHeight() == 1;
        }

        @Override
        public void prepare(@NonNull Bitmap bitmap) {
            bitmap.prepareToDraw();
        }

        @Override
        public void ranOutOfMemory(@NonNull Bitmap bitmap) {
            Log.w(TAG, "No memory for a level smaller than " + bitmap.getWidth() + "x" + bitmap.getHeight()
                    + ": its views draw that one");
        }
    };

    private final ImageLevels<Bitmap> mLevels;

    PresentedImage(long id, @NonNull Bitmap bitmap) {
        mLevels = new ImageLevels<>(bitmap, sBitmapHalving, sLevelMaker, SkiaPresentedImages::post,
                () -> SkiaPresentedImages.levelMade(id));
    }

    @NonNull
    Bitmap bitmap() {
        return mLevels.image();
    }

    /** See ImageLevels#levelToDraw: nothing while the level is on its way, since the bitmap drawn that small aliases. */
    @Nullable
    Bitmap levelToDraw(int level) {
        return mLevels.levelToDraw(level);
    }

    /** See ImageLevels#request; the image's observers are told once it is made (Observer#onLevelMade). */
    void request(int level) {
        mLevels.request(level);
    }

    /**
     * The level a view of the given size in pixels draws a bitmap of the given size at: the first that the view
     * minifies less than twofold on the side it minifies most. A view the bitmap's size or larger draws the bitmap.
     */
    static int levelFor(int bitmapWidth, int bitmapHeight, int viewWidth, int viewHeight) {
        if (viewWidth <= 0 || viewHeight <= 0) {
            return 0;
        }
        int level = 0;
        int width = bitmapWidth;
        int height = bitmapHeight;
        while ((width > 1 || height > 1) && (width >= 2L * viewWidth || height >= 2L * viewHeight)) {
            width = Math.max(1, width / 2);
            height = Math.max(1, height / 2);
            level++;
        }
        return level;
    }
}
