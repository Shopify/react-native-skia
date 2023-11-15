package com.shopify.reactnative.skia;

import android.graphics.SurfaceTexture;
import android.opengl.GLUtils;
import android.util.Log;

import javax.microedition.khronos.egl.EGL10;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.egl.EGLContext;
import javax.microedition.khronos.egl.EGLDisplay;
import javax.microedition.khronos.egl.EGLSurface;

public class SkiaRenderer {
    private static final String LOG_TAG = "SkiaRenderer";

    private static final int EGL_CONTEXT_CLIENT_VERSION = 0x3098;
    private static final int EGL_OPENGL_ES2_BIT = 4;
    private static final int STENCIL_BUFFER_SIZE = 8;

    EGLDisplay mEglDisplay;
    EGL10 mEgl;
    EGLConfig mEglConfig;
    EGLContext mEglContext;
    EGLSurface mPBufferSurface;
    private static SkiaRenderer sInstance;

    private SkiaRenderer() {
        mEgl = (EGL10) EGLContext.getEGL();

        mEglDisplay = mEgl.eglGetDisplay(EGL10.EGL_DEFAULT_DISPLAY);
        if (mEglDisplay == EGL10.EGL_NO_DISPLAY) {
            throw new RuntimeException("eglGetDisplay failed "
                    + GLUtils.getEGLErrorString(mEgl.eglGetError()));
        }

        int[] version = new int[2];
        if (!mEgl.eglInitialize(mEglDisplay, version)) {
            throw new RuntimeException("eglInitialize failed " +
                    GLUtils.getEGLErrorString(mEgl.eglGetError()));
        }

        mEglConfig = chooseEglConfig();
        if (mEglConfig == null) {
            throw new RuntimeException("eglConfig not initialized");
        }

        mEglContext = createContext(mEgl, mEglDisplay, mEglConfig);

        int[] attribs = new int[] {
                EGL10.EGL_WIDTH, 1,
                EGL10.EGL_HEIGHT, 1,
                EGL10.EGL_NONE
        };

        mPBufferSurface = mEgl.eglCreatePbufferSurface(mEglDisplay, mEglConfig, attribs);
        if (mPBufferSurface == null || mPBufferSurface == EGL10.EGL_NO_SURFACE) {
            int error = mEgl.eglGetError();
            throw new RuntimeException("createPbufferSurface failed "
                    + GLUtils.getEGLErrorString(error));
        }

        if (!mEgl.eglMakeCurrent(mEglDisplay, mPBufferSurface, mPBufferSurface, mEglContext)) {
            throw new RuntimeException("eglMakeCurrent failed "
                    + GLUtils.getEGLErrorString(mEgl.eglGetError()));
        }
    }

    private EGLConfig chooseEglConfig() {
        int[] configsCount = new int[1];
        EGLConfig[] configs = new EGLConfig[1];
        int[] configSpec = getConfig();
        if (!mEgl.eglChooseConfig(mEglDisplay, configSpec, configs, 1, configsCount)) {
            throw new IllegalArgumentException("eglChooseConfig failed " +
                    GLUtils.getEGLErrorString(mEgl.eglGetError()));
        } else if (configsCount[0] > 0) {
            return configs[0];
        }
        return null;
    }

    private int[] getConfig() {
        return new int[] {
            EGL10.EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
            EGL10.EGL_RED_SIZE, 8,
            EGL10.EGL_GREEN_SIZE, 8,
            EGL10.EGL_BLUE_SIZE, 8,
            EGL10.EGL_ALPHA_SIZE, 8,
            EGL10.EGL_DEPTH_SIZE, 0,
            EGL10.EGL_STENCIL_SIZE, STENCIL_BUFFER_SIZE,
            EGL10.EGL_NONE
        };
    }

    EGLContext createContext(EGL10 egl, EGLDisplay eglDisplay, EGLConfig eglConfig) {
        int[] attrib_list = { EGL_CONTEXT_CLIENT_VERSION, 2, EGL10.EGL_NONE };
        return egl.eglCreateContext(eglDisplay, eglConfig, EGL10.EGL_NO_CONTEXT, attrib_list);
    }

    EGLSurface makeOnscreenSurface(SurfaceTexture surfaceTexture) {
        EGLSurface surface = mEgl.eglCreateWindowSurface(mEglDisplay,
                mEglConfig, surfaceTexture, null);
        return surface;

    }

    void makeCurrent(EGLSurface surface) {
        mEgl.eglMakeCurrent(mEglDisplay, surface, surface,
                mEglContext);
    }

    void present(EGLSurface surface) {
        if (!mEgl.eglSwapBuffers(mEglDisplay, surface)) {
            int error = mEgl.eglGetError();
            if (error == EGL10.EGL_BAD_SURFACE
                    || error == EGL10.EGL_BAD_NATIVE_WINDOW) {

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
        mEgl.eglDestroySurface(mEglDisplay, surface);
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
                    mEgl.eglDestroyContext(mEglDisplay, mEglContext);
                    mEglContext = null;
                }
                if (mPBufferSurface != null) {
                    mEgl.eglDestroySurface(mEglDisplay, mPBufferSurface);
                    mPBufferSurface = null;
                }

                mEgl.eglMakeCurrent(mEglDisplay, EGL10.EGL_NO_SURFACE,  EGL10.EGL_NO_SURFACE,
                        EGL10.EGL_NO_CONTEXT);

                mEgl.eglTerminate(mEglDisplay);
                mEglDisplay = null;
            }
        } finally {
            super.finalize();
        }
    }
}
