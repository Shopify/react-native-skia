package com.shopify.reactnative.skia;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.BaseViewManager;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class RNSkiaViewManager extends BaseViewManager<SkiaDrawView, LayoutShadowNode> {

    private SkiaDrawView mView;
    private int mNativeId;

    @NonNull
    @Override
    public String getName() {
        return "ReactNativeSkiaView";
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
    public void updateExtraData(SkiaDrawView root, Object extraData) {
    }

    @Override
    public void setNativeId(@NonNull SkiaDrawView view, @Nullable String nativeId) {
        super.setNativeId(view, nativeId);
        mNativeId = Integer.parseInt(nativeId);
        RNSkiaModule skiaModule = ((ReactContext)mView.getContext()).getNativeModule(RNSkiaModule.class);
        skiaModule.getSkiaManager().register(mNativeId, mView);
    }

    @ReactProp(name = "mode")
    public void setMode(SkiaDrawView view, String mode) {
        view.setMode(mode);
    }

    @ReactProp(name = "debug")
    public void setDebug(SkiaDrawView view, boolean show) {
        view.setDebugMode(show);
    }

    @Override
    public void onDropViewInstance(@NonNull SkiaDrawView view) {
        super.onDropViewInstance(view);
        RNSkiaModule skiaModule = ((ReactContext)view.getContext()).getNativeModule(RNSkiaModule.class);
        skiaModule.getSkiaManager().unregister(mNativeId);
        view.onRemoved();
    }

    @NonNull
    @Override
    protected SkiaDrawView createViewInstance(@NonNull ThemedReactContext reactContext) {
        mView = new SkiaDrawView(reactContext);
        return mView;
    }
}