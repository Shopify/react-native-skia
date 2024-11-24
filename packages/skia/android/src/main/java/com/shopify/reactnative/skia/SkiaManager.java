package com.shopify.reactnative.skia;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.RuntimeExecutor;

@DoNotStrip
public class SkiaManager {

    @DoNotStrip
    private HybridData mHybridData;

    @DoNotStrip
    private ReactContext mContext;

    @DoNotStrip
    private PlatformContext mPlatformContext;

    @DoNotStrip
    SkiaManager(ReactContext context) {
        super();
        mContext = context;

        RuntimeExecutor runtimeExecutor = ReactNativeCompatible.getRuntimeExecutor(context);

        mPlatformContext = new PlatformContext(context);

        mHybridData = initHybrid(context.getJavaScriptContextHolder().get(), runtimeExecutor, mPlatformContext);

        initializeRuntime();
    }

    public void destroy() {
        mHybridData.resetNative();
    }

    public float getPixelDensity() {
        return mContext.getResources().getDisplayMetrics().density;
    }

    public PlatformContext getPlatformContext() {
        return mPlatformContext;
    }

    // private C++ functions
    private native HybridData initHybrid(long jsContext, RuntimeExecutor runtimeExecutor,
            PlatformContext platformContext);

    private native void initializeRuntime();
    public native void invalidate();

}