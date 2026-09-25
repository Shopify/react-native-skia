package com.reactnative.skia;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.viewmanagers.SkiaGraphiteViewManagerDelegate;
import com.facebook.react.viewmanagers.SkiaGraphiteViewManagerInterface;

import androidx.annotation.NonNull;

public class SkiaGraphiteViewManager extends SkiaBaseViewManager<SkiaGraphiteView> implements SkiaGraphiteViewManagerInterface<SkiaGraphiteView> {

    protected SkiaGraphiteViewManagerDelegate mDelegate;

    SkiaGraphiteViewManager() {
        mDelegate = new SkiaGraphiteViewManagerDelegate(this);
    }

    protected SkiaGraphiteViewManagerDelegate getDelegate() {
        return mDelegate;
    }

    @NonNull
    @Override
    public String getName() {
        return "SkiaGraphiteView";
    }

    @NonNull
    @Override
    public SkiaGraphiteView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaGraphiteView(reactContext);
    }
}
