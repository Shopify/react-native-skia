package com.reactnative.skia;

import android.os.Build;

import androidx.annotation.Nullable;

/**
 * The Android view a SkiaView draws into, see SkiaView.updateView(), and the
 * rules the props resolve by. The JS side (views/android.ts) mirrors them to
 * warn in development.
 */
enum BackingViewKind {
    SURFACE_VIEW,
    TEXTURE_VIEW;

    /**
     * The kind the androidBackingView prop names. "HardwareBufferView" (a plain
     * view drawing each frame's AHardwareBuffer inline, as React Native WebGPU's
     * does) is not available here yet: it falls back to a TextureView, which
     * composites the same way, and the JS side warns about it in development.
     * The default is a TextureView.
     */
    static BackingViewKind fromBackingView(@Nullable String backingView) {
        return "SurfaceView".equals(backingView) ? SURFACE_VIEW : TEXTURE_VIEW;
    }

    /**
     * Whether a canvas gets the 10-bit format: only on a SurfaceView, whose
     * layer the compositor shows as is. A TextureView composites through an
     * 8-bit pass anyway.
     */
    static boolean resolveHighBitDepth(BackingViewKind kind, boolean highBitDepth) {
        return highBitDepth && kind == SURFACE_VIEW;
    }

    /**
     * Whether the canvas composites as opaque: what the prop asks for, except
     * that the 10-bit format only has 2 bits of alpha, so a canvas that gets it
     * is opaque.
     */
    static boolean resolveOpaque(boolean opaque, boolean surfaceHighBitDepth) {
        return opaque || surfaceHighBitDepth;
    }

    /**
     * Whether a changed zOrderOnTop moves a mounted SurfaceView: SurfaceView
     * applies it to its live surface from Android 11, for an app targeting it.
     * Before that, the surface reads it when it is created, and so does a media
     * overlay on Android 13, whose SurfaceView moves a surface leaving the top
     * to the default sublayer at once, before setZOrderMediaOverlay() can ask
     * for its own: it would come back among the other SurfaceViews below the
     * window rather than above them.
     */
    static boolean zOrderOnTopChangesInPlace(int sdk, int targetSdk, boolean mediaOverlay) {
        if (sdk < Build.VERSION_CODES.R || targetSdk < Build.VERSION_CODES.R) {
            return false;
        }
        return !(mediaOverlay && sdk == Build.VERSION_CODES.TIRAMISU);
    }

    /**
     * Whether a changed zOrderMediaOverlay moves a mounted SurfaceView: only
     * from Android 14, whose SurfaceView compares the sublayer it is asked for
     * with the one its surface has. Up to Android 13, setZOrderMediaOverlay()
     * only sets the sublayer the next surface is created with.
     */
    static boolean zOrderMediaOverlayChangesInPlace(int sdk) {
        return sdk >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE;
    }
}
