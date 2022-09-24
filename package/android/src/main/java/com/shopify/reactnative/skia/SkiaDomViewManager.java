package com.shopify.reactnative.skia;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.BaseViewManager;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.HashMap;

public class SkiaDomViewManager extends BaseViewManager<SkiaDomView, LayoutShadowNode> {

    @NonNull
    @Override
    public String getName() {
        return "SkiaDomView";
    }

    @Override
    public LayoutShadowNode createShadowNodeInstance() {
        return new LayoutShadowNode();
    }

    @Override
    public Class<? extends LayoutShadowNode> getShadowNodeClass() {
        return LayoutShadowNode.class;
    }

    @Override
    public void updateExtraData(SkiaDomView root, Object extraData) {
    }

    @Override
    public void setNativeId(@NonNull SkiaDomView view, @Nullable String nativeId) {
        super.setNativeId(view, nativeId);
        int nativeIdResolved = Integer.parseInt(nativeId);
        view.registerView(nativeIdResolved);
    }

    @ReactProp(name = "mode")
    public void setMode(SkiaDomView view, String mode) {
        view.setMode(mode);
    }

    @ReactProp(name = "debug")
    public void setDebug(SkiaDomView view, boolean show) {
        view.setDebugMode(show);
    }

    @Override
    public void onDropViewInstance(@NonNull SkiaDomView view) {
        super.onDropViewInstance(view);
        view.unregisterView();
    }

    @NonNull
    @Override
    protected SkiaDomView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaDomView(reactContext);
    }
}