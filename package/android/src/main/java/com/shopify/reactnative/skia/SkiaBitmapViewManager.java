package com.shopify.reactnative.skia;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class SkiaBitmapViewManager extends SimpleViewManager<SkiaBitmapView> {
    private static final String REACT_CLASS = "SkiaBitmapView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public SkiaBitmapView createViewInstance(ThemedReactContext context) {
        return new SkiaBitmapView(context);
    }

    @ReactProp(name = "bitmap")
    public void setBitmap(SkiaBitmapView view, String bitmap) {
        view.setBitmap(bitmap);
    }
}
