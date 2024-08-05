package com.shopify.reactnative.skia;

import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.uimanager.SimpleViewManager;

public abstract class SkiaViewManagerSpec<T extends View> extends SimpleViewManager<T> {
  public abstract void setContextId(T view, int contextId);
}