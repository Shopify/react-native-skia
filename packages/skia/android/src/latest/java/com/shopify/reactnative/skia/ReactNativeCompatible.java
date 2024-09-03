package com.shopify.reactnative.skia;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.RuntimeExecutor;

/* package */ final class ReactNativeCompatible {
    public static RuntimeExecutor getRuntimeExecutor(ReactContext context) {
        return context.getCatalystInstance().getRuntimeExecutor();
    }
}

