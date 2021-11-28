// RnskiaModule.java

package com.shopify.reactnative.skia;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;

import java.lang.ref.WeakReference;

@ReactModule(name="RNSkia")
public class RNSkiaModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private final WeakReference<ReactApplicationContext> weakReactContext;
    private SkiaManager skiaManager;

    static {
        System.loadLibrary("reactskia");
    }

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

        this.skiaManager.invalidate();
        this.skiaManager.destroy();
        this.skiaManager = null;
    }

    @Override
    public String getName() {
        return "RNSkia";
    }

    public SkiaManager getSkiaManager() {
        return skiaManager;
    }

    @Override
    public void initialize() {
        super.initialize();

        if(skiaManager == null) {
            skiaManager = new SkiaManager(weakReactContext.get());
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
