// RnskiaModule.java

package com.shopify.reactnative.skia;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;

import java.lang.ref.WeakReference;

@ReactModule(name="RNSkia")
public class RNSkiaModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static SkiaManager sharedSkiaManager;

    static {
        System.loadLibrary("reactskia");
    }

    public RNSkiaModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public void invalidate() {
        super.invalidate();

        if (getReactApplicationContext() != null) {
            getReactApplicationContext().removeLifecycleEventListener(this);
        }

        if (sharedSkiaManager != null) {
            sharedSkiaManager.invalidate();
            sharedSkiaManager.destroy();
            sharedSkiaManager = null;
        }
    }

    @Override
    public String getName() {
        return "RNSkia";
    }

    public SkiaManager getSkiaManager() {
        if (sharedSkiaManager == null) {
            throw new RuntimeException("Skia Manager is not initialized! Did you forget to add `RNSkiaModulePackage` to your `getJSIModulePackage()` method in your app's `MainApplication.java`? Also make sure to disable any remote debugger (e.g. Chrome)");
        }
        return sharedSkiaManager;
    }

    public static void initializeSkiaManager(ReactApplicationContext reactContext) {
        if(sharedSkiaManager == null) {
            sharedSkiaManager = new SkiaManager(reactContext);
        }
    }

    @Override
    public void onHostResume() {
        if(sharedSkiaManager != null) sharedSkiaManager.onHostResume();
    }

    @Override
    public void onHostPause() {
        if(sharedSkiaManager != null) sharedSkiaManager.onHostPause();
    }

    @Override
    public void onHostDestroy() {

    }
}
