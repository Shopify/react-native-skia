package com.shopify.reactnative.skia;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.PixelCopy;
import android.view.SurfaceView;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.view.ReactViewGroup;

import java.lang.reflect.Method;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class ViewScreenshotService {
    private static final long SURFACE_VIEW_READ_PIXELS_TIMEOUT = 5;
    private static final String TAG = "SkiaScreenshot";

    public static Bitmap makeViewScreenshotFromTag(ReactContext context, int tag) {
        UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
        View view = null;
        try {
            view = uiManager.resolveView(tag);
        } catch (RuntimeException e) {
            context.handleException(e);
        }
        if (view == null) {
            return null;
        }

        int width = view.getWidth();
        int height = view.getHeight();
        if (width <= 0 || height <= 0) {
            return null;
        }

        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        final Canvas canvas = new Canvas(bitmap);
        final Paint paint = createPaint();

        canvas.save();
        canvas.translate(-view.getLeft(), -view.getTop());
        renderViewToCanvas(canvas, view, paint, 1.0f); // Initial opacity
        canvas.restore();

        return bitmap;
    }

    private static Paint createPaint() {
        final Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setFilterBitmap(true);
        paint.setDither(true);
        return paint;
    }

    private static void renderViewToCanvas(Canvas canvas, View view, Paint paint, float parentOpacity) {
        float combinedOpacity = parentOpacity * view.getAlpha();
        canvas.save();
        applyTransformations(canvas, view);

        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            drawBackgroundIfPresent(canvas, view, combinedOpacity);
            drawChildren(canvas, group, paint, combinedOpacity);
        } else {
            drawView(canvas, view, paint, combinedOpacity);
        }

        canvas.restore();
    }

    private static void drawBackgroundIfPresent(Canvas canvas, View view, float opacity) {
        Drawable bg = view.getBackground();
        if (bg != null) {
            canvas.saveLayerAlpha(null, Math.round(opacity * 255));
            bg.draw(canvas);
            canvas.restore();
        }
    }

    private static void drawChildren(Canvas canvas, ViewGroup group, Paint paint, float parentOpacity) {
        // Handle clipping for ReactViewGroup
        if (group instanceof ReactViewGroup) {
            try {
                Class[] cArg = new Class[1];
                cArg[0] = Canvas.class;
                Method method = ReactViewGroup.class.getDeclaredMethod("dispatchOverflowDraw", cArg);
                method.setAccessible(true);
                method.invoke(group, canvas);
            } catch (Exception e) {
                Log.e(TAG, "couldn't invoke dispatchOverflowDraw() on ReactViewGroup", e);
            }
        }
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            if (child.getVisibility() != View.VISIBLE) continue;

            if (child instanceof TextureView) {
                drawTextureView(canvas, (TextureView) child, paint, parentOpacity);
            } else if (child instanceof SurfaceView) {
                drawSurfaceView(canvas, (SurfaceView) child, paint, parentOpacity);
            } else {
                renderViewToCanvas(canvas, child, paint, parentOpacity);
            }
        }
    }

    private static void drawView(Canvas canvas, View view, Paint paint, float opacity) {
        canvas.saveLayerAlpha(null, Math.round(opacity * 255));
        view.draw(canvas);
        canvas.restore();
    }

    private static void drawTextureView(Canvas canvas, TextureView tv, Paint paint, float opacity) {
        tv.setOpaque(false);
        Bitmap childBitmapBuffer = tv.getBitmap(Bitmap.createBitmap(tv.getWidth(), tv.getHeight(), Bitmap.Config.ARGB_8888));
        canvas.save();
        applyTransformations(canvas, tv);
        canvas.drawBitmap(childBitmapBuffer, 0, 0, paint);
        canvas.restore();
    }

    private static void drawSurfaceView(Canvas canvas, SurfaceView sv, Paint paint, float opacity) {
        final CountDownLatch latch = new CountDownLatch(1);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            Bitmap childBitmapBuffer = Bitmap.createBitmap(sv.getWidth(), sv.getHeight(), Bitmap.Config.ARGB_8888);
            try {
                PixelCopy.request(sv, childBitmapBuffer, copyResult -> {
                    canvas.save();
                    applyTransformations(canvas, sv);
                    canvas.drawBitmap(childBitmapBuffer, 0, 0, paint);
                    canvas.restore();
                    latch.countDown();
                }, new Handler(Looper.getMainLooper()));
                latch.await(SURFACE_VIEW_READ_PIXELS_TIMEOUT, TimeUnit.SECONDS);
            } catch (Exception e) {
                Log.e(TAG, "Cannot PixelCopy for " + sv, e);
            }
        } else {
            Bitmap cache = sv.getDrawingCache();
            if (cache != null) {
                canvas.save();
                applyTransformations(canvas, sv);
                canvas.drawBitmap(cache, 0, 0, paint);
                canvas.restore();
            }
        }
    }

    @NonNull
    private static void applyTransformations(final Canvas c, @NonNull final View view) {
        final Matrix matrix = view.getMatrix();
        final Matrix translateMatrix = new Matrix();
        translateMatrix.setTranslate(view.getLeft() + view.getPaddingLeft(), view.getTop() + view.getPaddingTop());
        c.concat(translateMatrix);
        c.concat(matrix);
    }
}
