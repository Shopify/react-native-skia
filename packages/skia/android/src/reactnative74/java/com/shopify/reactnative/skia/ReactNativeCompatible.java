package com.shopify.reactnative.skia;

import androidx.annotation.OptIn;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.RuntimeExecutor;
import com.facebook.react.common.annotations.FrameworkAPI;

/* package */ final class ReactNativeCompatible {
    @OptIn(markerClass = FrameworkAPI.class)
    public static RuntimeExecutor getRuntimeExecutor(ReactContext context) {
        return context.getRuntimeExecutor();
    }
}
