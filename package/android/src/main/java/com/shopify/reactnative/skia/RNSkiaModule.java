// RnskiaModule.java

package com.shopify.reactnative.skia;

import android.util.Log;

import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.lang.ref.WeakReference;
import java.util.HashSet;
import java.util.Set;

@ReactModule(name="RNSkiaModule")
public class RNSkiaModule extends NativeSkiaModuleSpec implements LifecycleEventListener {
    public static final String NAME = "RNSkiaModule";

    private final WeakReference<ReactApplicationContext> weakReactContext;
    private SkiaManager skiaManager;

    private final Object mContextLock = new Object();
    private final Set<Integer> mSurfaceContextsIds = new HashSet<>();

    public RNSkiaModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.weakReactContext = new WeakReference<>(reactContext);
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public void invalidate() {
        super.invalidate();

        if (getReactApplicationContext() != null) {
            getReactApplicationContext().removeLifecycleEventListener(this);
        }

        if (this.skiaManager != null) {
            this.skiaManager.invalidate();
            this.skiaManager.destroy();
            this.skiaManager = null;
        }
    }

    @Override
    public String getName() {
        return NAME;
    }

    public SkiaManager getSkiaManager() {
        return skiaManager;
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean install() {
        if (skiaManager != null) {
            // Already initialized, ignore call.
            return true;
        }

        try {
            System.loadLibrary("rnskia");
            ReactApplicationContext context = weakReactContext.get();
            if (context == null) {
                Log.e(NAME, "React Application Context was null!");
                return false;
            }
            skiaManager = new SkiaManager(context);
            return true;
        } catch (Exception exception) {
            Log.e(NAME, "Failed to initialize Skia Manager!", exception);
            return false;
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean createSurfaceContext(double contextId) {
      waitForNativeSurface((int)contextId);
  
      ReactApplicationContext context = getReactApplicationContext();
      JavaScriptContextHolder jsContext = context.getJavaScriptContextHolder();
      skiaManager.createSurfaceContext(jsContext.get(), (int)contextId);
      return true;
    }


    private void waitForNativeSurface(Integer contextId) {
        synchronized (mContextLock) {
            while (!mSurfaceContextsIds.contains(contextId)) {
                try {
                    mContextLock.wait();
                } catch (InterruptedException e) {
                    Log.e("RNWebGPU", "Unable to create a context");
                    return;
                }
            }
        }
    }

    protected void onSurfaceCreated(Integer contextId) {
        synchronized (mContextLock) {
            mSurfaceContextsIds.add(contextId);
            mContextLock.notifyAll();
        }
    }

    @Override
    public void onHostResume() {
        if(skiaManager != null) skiaManager.onHostResume();
    }

    @Override
    public void onHostPause() {
        if(skiaManager != null) skiaManager.onHostPause();
    }

    @Override
    public void onHostDestroy() {

    }
}
