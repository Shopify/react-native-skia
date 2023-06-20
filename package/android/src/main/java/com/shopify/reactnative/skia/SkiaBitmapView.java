package com.shopify.reactnative.skia;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.util.Base64;
import android.util.Log;
import android.view.View;

import com.facebook.react.views.view.ReactViewGroup;

public class SkiaBitmapView extends View {
    private static final String TAG = "SkiaBitmapView";

    private Bitmap bitmap;

    public SkiaBitmapView(Context context) {
        super(context);
        Log.d(TAG, "SkiaBitmapView created");
        init();
    }

    private void init() {
        // Generate cyan bitmap by default
        this.bitmap = generateCyanBitmap(100, 100);
    }

    public void setBitmap(String base64Bitmap) {
        Log.d(TAG, "setBitmap called with data: " + base64Bitmap.substring(0, 30) + "..."); // log the first 30 characters
        byte[] decodedString = Base64.decode(base64Bitmap, Base64.DEFAULT);
        Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
        if (decodedByte == null) {
            Log.d(TAG, "Bitmap decoding failed");
        } else {
            Log.d(TAG, "Bitmap decoding succeeded");
            this.bitmap = decodedByte;
        }
        invalidate(); // Cause the view to redraw
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (bitmap != null) {
            // Draw the bitmap to fill the view
            Rect destRect = new Rect(0, 0, getWidth(), getHeight());
            canvas.drawBitmap(bitmap, null, destRect, null);
        }
    }

    private Bitmap generateCyanBitmap(int width, int height) {
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        canvas.drawColor(Color.CYAN);
        return bitmap;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int height = MeasureSpec.getSize(heightMeasureSpec);

        // Ensure non-zero size
        int defaultSize = 100; // Default size if no specific dimensions are provided
        if (width == 0 && height == 0) {
            width = defaultSize;
            height = defaultSize;
        } else if (width == 0) {
            width = height;
        } else if (height == 0) {
            height = width;
        }

        setMeasuredDimension(width, height);
    }
}
