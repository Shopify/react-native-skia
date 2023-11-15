package com.shopify.reactnative.skia;

import android.graphics.SurfaceTexture;
import android.opengl.EGL14;
import android.opengl.EGLConfig;
import android.opengl.EGLContext;
import android.opengl.EGLDisplay;
import android.opengl.EGLExt;
import android.opengl.EGLSurface;
import android.opengl.GLUtils;
import android.util.Log;

public class SkiaRenderer {
    private static final String LOG_TAG = "SkiaRenderer";

    private static final int EGL_CONTEXT_CLIENT_VERSION = 0x3098;
    private static final int EGL_OPENGL_ES2_BIT = 4;
    private static final int STENCIL_BUFFER_SIZE = 8;

    EGLDisplay mEglDisplay;
    EGLConfig mEglConfig;
    EGLContext mEglContext;
    EGLSurface mPBufferSurface;
    private static SkiaRenderer sInstance;

    private SkiaRenderer() {
        mEglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY);
        if (mEglDisplay == EGL14.EGL_NO_DISPLAY) {
            throw new RuntimeException("eglGetDisplay failed "
                    + GLUtils.getEGLErrorString(EGL14.eglGetError()));
        }

        int[] version = new int[2];
        if (!EGL14.eglInitialize(mEglDisplay, null, 0, null, 0)) {
            throw new RuntimeException("eglInitialize failed " +
                    GLUtils.getEGLErrorString(EGL14.eglGetError()));
        }

        mEglConfig = chooseEglConfig();
        if (mEglConfig == null) {
            throw new RuntimeException("eglConfig not initialized");
        }

        mEglContext = createContext( mEglDisplay, mEglConfig);

        int[] attribs = new int[] {
                EGL14.EGL_WIDTH, 1,
                EGL14.EGL_HEIGHT, 1,
                EGL14.EGL_NONE
        };

        mPBufferSurface = EGL14.eglCreatePbufferSurface(mEglDisplay, mEglConfig, attribs, 0);
        if (mPBufferSurface == null || mPBufferSurface == EGL14.EGL_NO_SURFACE) {
            int error = EGL14.eglGetError();
            throw new RuntimeException("createPbufferSurface failed "
                    + GLUtils.getEGLErrorString(error));
        }

        if (!EGL14.eglMakeCurrent(mEglDisplay, mPBufferSurface, mPBufferSurface, mEglContext)) {
            throw new RuntimeException("eglMakeCurrent failed "
                    + GLUtils.getEGLErrorString(EGL14.eglGetError()));
        }
    }

    private EGLConfig chooseEglConfig() {
        int[] configsCount = new int[1];
        EGLConfig[] configs = new EGLConfig[1];
        int[] configSpec = getConfig();
        if (!EGL14.eglChooseConfig(mEglDisplay, configSpec, 0, configs, 0, configs.length, configsCount, 0)) {
            throw new IllegalArgumentException("eglChooseConfig failed " +
                    GLUtils.getEGLErrorString(EGL14.eglGetError()));
        } else if (configsCount[0] > 0) {
            return configs[0];
        }
        return null;
    }

    private int[] getConfig() {
        return new int[] {
                EGL14.EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
                EGL14.EGL_RED_SIZE, 8,
                EGL14.EGL_GREEN_SIZE, 8,
                EGL14.EGL_BLUE_SIZE, 8,
                EGL14.EGL_ALPHA_SIZE, 8,
                EGL14.EGL_DEPTH_SIZE, 0,
                EGL14.EGL_STENCIL_SIZE, STENCIL_BUFFER_SIZE,
                EGL14.EGL_NONE
        };
    }

    EGLContext createContext(EGLDisplay eglDisplay, EGLConfig eglConfig) {
        int[] attrib_list = { EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE };
        return EGL14.eglCreateContext(eglDisplay, eglConfig, EGL14.EGL_NO_CONTEXT, attrib_list, 0);
    }

    EGLSurface makeOnscreenSurface(SurfaceTexture surfaceTexture) {
        EGLSurface surface = EGL14.eglCreateWindowSurface(mEglDisplay,
                mEglConfig, surfaceTexture, new int[]{ EGL14.EGL_NONE },  0);
        return surface;

    }

    void makeCurrent(EGLSurface surface) {
        EGL14.eglMakeCurrent(mEglDisplay, surface, surface,
                mEglContext);
    }

    void present(EGLSurface surface) {
        if (!EGL14.eglSwapBuffers(mEglDisplay, surface)) {
            int error = EGL14.eglGetError();
            if (error == EGL14.EGL_BAD_SURFACE
                    || error == EGL14.EGL_BAD_NATIVE_WINDOW) {

                // This really shouldn't happen, but if it does we can recover
                // easily by just not trying to use the surface anymore
                Log.w(LOG_TAG, "swapBuffers failed "
                        + GLUtils.getEGLErrorString(error));
                return;
            }

            // Some other fatal EGL error happened, log an error and stop the
            // animation.
            throw new RuntimeException("Cannot swap buffers "
                    + GLUtils.getEGLErrorString(error));
        }
    }

    void destroy(EGLSurface surface) {
        makeCurrent(surface);
        EGL14.eglDestroySurface(mEglDisplay, surface);
    }

    public static SkiaRenderer getInstance() {
        if (sInstance == null) {
            sInstance = new SkiaRenderer();
        }
        return sInstance;
    }

    @Override
    protected void finalize() throws Throwable {
        try {
            if (mEglDisplay != null) {
                if (mEglContext != null) {
                    EGL14.eglDestroyContext(mEglDisplay, mEglContext);
                    mEglContext = null;
                }
                if (mPBufferSurface != null) {
                    EGL14.eglDestroySurface(mEglDisplay, mPBufferSurface);
                    mPBufferSurface = null;
                }

                EGL14.eglMakeCurrent(mEglDisplay, EGL14.EGL_NO_SURFACE,  EGL14.EGL_NO_SURFACE,
                        EGL14.EGL_NO_CONTEXT);

                EGL14.eglTerminate(mEglDisplay);
                mEglDisplay = null;
            }
        } finally {
            super.finalize();
        }
    }
}
