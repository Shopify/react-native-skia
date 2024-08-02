package com.shopify.reactnative.skia;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.viewmanagers.SkiaImperativeViewManagerDelegate;
import com.facebook.react.viewmanagers.SkiaImperativeViewManagerInterface;

public class SkiaImperativeViewManager extends SkiaBaseViewManager<SkiaImperativeView> implements SkiaImperativeViewManagerInterface<SkiaImperativeView> {


    protected SkiaImperativeViewManagerDelegate mDelegate;

    SkiaImperativeViewManager() {
        mDelegate = new SkiaImperativeViewManagerDelegate(this);
    }

    protected SkiaImperativeViewManagerDelegate getDelegate() {
        return mDelegate;
    }

    @NonNull
    @Override
    public String getName() {
        return "SkiaImperativeView";
    }

    @NonNull
    @Override
    public SkiaImperativeView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaImperativeView(reactContext);
    }
}