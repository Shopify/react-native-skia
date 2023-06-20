package com.shopify.reactnative.skia;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

public class SkiaBitmapViewManager extends ReactViewManager {
    private static final String REACT_CLASS = "SkiaBitmapView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public void setNativeId(@NonNull ReactViewGroup view, @Nullable String nativeId) {
        super.setNativeId(view, nativeId);
        int nativeIdResolved = Integer.parseInt(nativeId);
        ((SkiaBitmapView) view).registerView(nativeIdResolved);
    }

    @NonNull
    @Override
    public SkiaBitmapView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaBitmapView(reactContext);
    }
}
