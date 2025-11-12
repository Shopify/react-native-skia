package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;

public class SkiaPictureView extends SkiaBaseView {
    @DoNotStrip
    private HybridData mHybridData;
    private Paint paint = new Paint();

    private boolean coldStart = false;

    public SkiaPictureView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

    public void setColdStart(boolean coldStart) {
        this.coldStart = coldStart;
        invalidate(); // Trigger redraw when property changes
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        // Skip the warming up feature if coldStart is true
        if (coldStart) {
            return; // Skip the warming up feature when cold start is requested
        }

        // Get the view dimensions
        int width = getWidth();
        int height = getHeight();

        if (width > 0 && height > 0) {
            // Get the bitmap data from native
            int[] pixels = getBitmap(width, height);

            if (pixels != null && pixels.length == width * height) {
                // Create bitmap from pixels
                // TODO: remove allocation
                Bitmap bitmap = Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888);

                // Draw the bitmap on the canvas
                paint.setFilterBitmap(true);
                canvas.drawBitmap(bitmap, 0, 0, paint);

                // Clean up
                bitmap.recycle();
            }
        }
    }

    private native HybridData initHybrid(SkiaManager skiaManager);

    protected native void surfaceAvailable(Object surface, int width, int height, boolean opaque);

    protected native void surfaceSizeChanged(Object surface, int width, int height, boolean opaque);

    protected native void surfaceDestroyed();

    protected native void setBgColor(int color);

    protected native void setDebugMode(boolean show);

    protected native void registerView(int nativeId);

    protected native void unregisterView();

    protected native int[] getBitmap(int width, int height);
}
