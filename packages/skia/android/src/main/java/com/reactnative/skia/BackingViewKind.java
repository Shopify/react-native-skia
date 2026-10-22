package com.reactnative.skia;

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
     * Whether a frame presented into the canvas waits until its window has
     * drawn the one before it (see JniSkiaView::frameLatched): a TextureView,
     * whose frames the window takes when it draws, in no order with the
     * presents. A frame presented before that draw replaces the one not taken
     * yet, and from Android 11 its buffer queue waits up to 4.29 s for a buffer
     * only that draw gives back. A SurfaceView's compositor takes its frames
     * itself.
     */
    static boolean latchesOnWindowDraw(BackingViewKind kind) {
        return kind == TEXTURE_VIEW;
    }
}
