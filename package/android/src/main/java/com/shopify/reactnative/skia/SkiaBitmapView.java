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
import android.view.ViewGroup;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.views.view.ReactViewGroup;

public class SkiaBitmapView extends ReactViewGroup {
    private static final String TAG = "SkiaBitmapView";

    private Bitmap bitmap;
    private SkiaManager skiaManager;

    public SkiaBitmapView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        skiaManager = skiaModule.getSkiaManager();
        Log.d(TAG, "SkiaBitmapView created");
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


    protected void registerView(int nativeId){
        Log.d(TAG, "registerView()");
        byte[] byteArray = this.skiaManager.getJsiProperty(nativeId, "bitmap");
        this.bitmap = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.length);
        Log.d(TAG, "Bitmap is set");
    }

    protected void unregisterView(){}
}
