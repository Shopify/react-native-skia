// RnskiaModule.java

package com.shopify.reactnative.skia;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import java.lang.ref.WeakReference;

public class RNSkiaModule extends ReactContextBaseJavaModule {

    private final WeakReference<ReactApplicationContext> weakReactContext;
    private static SkiaManager skiaManager;

    static {
        System.loadLibrary("reactskia");
    }

    public RNSkiaModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.weakReactContext = new WeakReference<>(reactContext);
    }

    @Override
    public String getName() {
        return "RNSkia";
    }

    public static SkiaManager getSkiaManager() {
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
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        this.skiaManager.destroy();
        this.skiaManager = null;
    }
}
