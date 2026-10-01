package com.reactnative.skia;

import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.view.ReactViewGroup;
import com.facebook.react.views.view.ReactViewManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public abstract class SkiaBaseViewManager<T extends SkiaBaseView> extends ReactViewManager {

    @Override
    public void setNativeId(@NonNull ReactViewGroup view, @Nullable String nativeId) {
        super.setNativeId(view, nativeId);
        int nativeIdResolved = Integer.parseInt(nativeId);
        ((SkiaBaseView)view).registerView(nativeIdResolved);
    }

    @ReactProp(name = "debug")
    public void setDebug(T view, boolean show) {
        ((SkiaBaseView)view).setDebugMode(show);
    }

    @ReactProp(name = "opaque")
    public void setOpaque(T view, boolean value) {
        ((SkiaBaseView)view).setOpaque(value);
    }

    @ReactProp(name = "highBitDepth")
    public void setHighBitDepth(T view, boolean value) {
        ((SkiaBaseView)view).setHighBitDepth(value);
    }

    @ReactProp(name = "androidSurfaceType")
    public void setAndroidSurfaceType(T view, @Nullable String value) {
        ((SkiaBaseView)view).setSurfaceType(value);
    }

    @ReactProp(name = "androidZOrderOnTop")
    public void setAndroidZOrderOnTop(T view, boolean value) {
        ((SkiaBaseView)view).setZOrderOnTop(value);
    }

    // The backing view depends on several props (opaque, androidSurfaceType,
    // androidZOrderOnTop, highBitDepth), so it is resolved once per transaction
    // rather than in each setter.
    @Override
    protected void onAfterUpdateTransaction(@NonNull ReactViewGroup view) {
        super.onAfterUpdateTransaction(view);
        ((SkiaBaseView)view).updateView();
    }

    @ReactProp(name = ViewProps.POINTER_EVENTS)
    public void setPointerEvents(T view, @Nullable String pointerEventsStr) {
        view.setPointerEvents(PointerEvents.parsePointerEvents(pointerEventsStr));
    }

    @Override
    public void onDropViewInstance(@NonNull ReactViewGroup view) {
        super.onDropViewInstance(view);
        ((SkiaBaseView)view).dropInstance();
    }
}