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
        setWillNotDraw(false);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        skiaManager = skiaModule.getSkiaManager();
        Log.d(TAG, "SkiaBitmapView created");
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (bitmap != null) {
            // Draw the bitmap to fill the view
            Rect destRect = new Rect(0, 0, 100, 100);
            canvas.drawBitmap(bitmap, null, destRect, null);
        }
    }

    protected void registerView(int nativeId){
        int[] array = this.skiaManager.getJsiProperty(nativeId, "bitmap");
        this.bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888);
        this.bitmap.setPixels(array, 0, 100, 0, 0, 100, 100);
        invalidate();
    }

    protected void unregisterView(){}
}
