package com.shopify.reactnative.skia;

import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.SkiaPictureViewManagerDelegate;
import com.facebook.react.viewmanagers.SkiaPictureViewManagerInterface;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class SkiaPictureViewManager extends ReactViewManager implements SkiaPictureViewManagerInterface<SkiaPictureView> {

    protected SkiaPictureViewManagerDelegate mDelegate;

    SkiaPictureViewManager() {
        mDelegate = new SkiaPictureViewManagerDelegate(this);
    }

    protected SkiaPictureViewManagerDelegate getDelegate() {
        return mDelegate;
    }

    @NonNull
    @Override
    public String getName() {
        return "SkiaPictureView";
    }

    @NonNull
    @Override
    public SkiaPictureView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaPictureView(reactContext);
    }

    @Override
    public void setNativeId(@NonNull ReactViewGroup view, @Nullable String nativeId) {
        super.setNativeId(view, nativeId);
        int nativeIdResolved = Integer.parseInt(nativeId);
        ((SkiaPictureView) view).registerView(nativeIdResolved);
    }

    @Override
    @ReactProp(name = "debug")
    public void setDebug(SkiaPictureView view, boolean show) {
        view.setDebugMode(show);
    }

    @Override
    @ReactProp(name = "opaque")
    public void setOpaque(SkiaPictureView view, boolean value) {
        view.setOpaque(value);
    }

    @Override
    @ReactProp(name = "highBitDepth")
    public void setHighBitDepth(SkiaPictureView view, boolean value) {
        view.setHighBitDepth(value);
    }

    @Override
    @ReactProp(name = ViewProps.POINTER_EVENTS)
    public void setPointerEvents(SkiaPictureView view, @Nullable String pointerEventsStr) {
        view.setPointerEvents(PointerEvents.parsePointerEvents(pointerEventsStr));
    }

    @Override
    public void setColorSpace(SkiaPictureView view, @Nullable String value) {
        // nothing to do here at the moment
    }

    @Override
    public void setAndroidWarmup(SkiaPictureView view, boolean value) {
        view.setAndroidWarmup(value);
    }

    @Override
    public void onDropViewInstance(@NonNull ReactViewGroup view) {
        super.onDropViewInstance(view);
        ((SkiaPictureView) view).dropInstance();
    }
}
