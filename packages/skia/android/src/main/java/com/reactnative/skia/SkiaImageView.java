package com.reactnative.skia;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.views.view.ReactViewGroup;

/**
 * The Android view behind <SkiaImageView>: a React Native view that draws its
 * image's bitmap, shared with every view showing the same image, inside the
 * window's own drawing, or the smaller level of it its size asks for (see
 * PresentedImage). It has no surface, swapchain or native Skia view, so it
 * mounts and unmounts at the cost of any view, and it composites, clips, fades
 * and transforms like one.
 */
@SuppressLint("ViewConstructor")
public class SkiaImageView extends ReactViewGroup implements SkiaPresentedImages.Observer {

    private final Paint mPaint = new Paint(Paint.FILTER_BITMAP_FLAG);
    private final Rect mSource = new Rect();
    private final Rect mDestination = new Rect();

    // 0 shows nothing; see RNSkPresentedImages::idOf for the others.
    private long mImageId = 0;
    @Nullable
    private PresentedImage mPublishedImage;
    private int mLevelForSize = 0;
    // Kept while a level or an image is on its way.
    @Nullable
    private Bitmap mDrawnBitmap;

    public SkiaImageView(Context context) {
        super(context);
    }

    void setPresentedImageId(long id) {
        if (id == mImageId) {
            return;
        }
        if (mImageId != 0) {
            SkiaPresentedImages.unobserve(mImageId, this);
        }
        mImageId = id;
        mPublishedImage = null;
        if (id == 0) {
            mDrawnBitmap = null;
            invalidate();
            return;
        }
        // Until the new image's bitmap is published, the view keeps the one it
        // shows: a change of image never shows nothing in between.
        PresentedImage published = SkiaPresentedImages.observe(id, this);
        if (published != null) {
            show(published);
        }
    }

    @Override
    public void onImagePublished(@NonNull PresentedImage image) {
        show(image);
    }

    @Override
    public void onLevelMade() {
        takeLevel();
    }

    @Override
    protected void onSizeChanged(int width, int height, int oldWidth, int oldHeight) {
        super.onSizeChanged(width, height, oldWidth, oldHeight);
        PresentedImage image = mPublishedImage;
        if (image != null) {
            show(image);
        }
    }

    // Before layout the view has no size to pick a level by: it asks once it is laid out.
    private void show(@NonNull PresentedImage image) {
        mPublishedImage = image;
        if (getWidth() <= 0 || getHeight() <= 0) {
            return;
        }
        Bitmap bitmap = image.bitmap();
        mLevelForSize = PresentedImage.levelFor(bitmap.getWidth(), bitmap.getHeight(), getWidth(), getHeight());
        image.request(mLevelForSize);
        takeLevel();
    }

    // A view that is not laid out has no level yet (see show).
    private void takeLevel() {
        PresentedImage image = mPublishedImage;
        if (image == null || getWidth() <= 0 || getHeight() <= 0) {
            return;
        }
        Bitmap level = image.levelToDraw(mLevelForSize);
        if (level != null && level != mDrawnBitmap) {
            mDrawnBitmap = level;
            invalidate();
        }
    }

    // After ReactViewGroup's own drawing, inside the clip it sets for overflow
    // and the border radius, where its children would be.
    @Override
    protected void dispatchDraw(@NonNull Canvas canvas) {
        super.dispatchDraw(canvas);
        Bitmap bitmap = mDrawnBitmap;
        if (bitmap == null) {
            return;
        }
        // The image fills the view: a view laid out at the image's size in
        // pixels draws it unscaled.
        mSource.set(0, 0, bitmap.getWidth(), bitmap.getHeight());
        mDestination.set(0, 0, getWidth(), getHeight());
        canvas.drawBitmap(bitmap, mSource, mDestination, mPaint);
    }
}
