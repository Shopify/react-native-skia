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

    public SkiaPictureView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        // Get the view dimensions
        int width = getWidth();
        int height = getHeight();

        if (width > 0 && height > 0) {
            // Get the bitmap data from native
            byte[] bitmapData = getBitmap(width, height);

            if (bitmapData != null && bitmapData.length == width * height * 4) {
                // Convert byte array to int array for Bitmap (ARGB format)
                int[] pixels = new int[width * height];
                for (int i = 0; i < pixels.length; i++) {
                    int offset = i * 4;
                    // Convert from RGBA to ARGB format
                    int r = bitmapData[offset] & 0xFF;
                    int g = bitmapData[offset + 1] & 0xFF;
                    int b = bitmapData[offset + 2] & 0xFF;
                    int a = bitmapData[offset + 3] & 0xFF;
                    pixels[i] = (a << 24) | (r << 16) | (g << 8) | b;
                }

                // Create bitmap from pixels
                Bitmap bitmap = Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888);

                // Draw the bitmap on the canvas
                Paint paint = new Paint();
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

    protected native byte[] getBitmap(int width, int height);
}
