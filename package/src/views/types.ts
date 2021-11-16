import React from "react";
import { NativeMethods, requireNativeComponent, ViewProps } from "react-native";
import { RNSkiaView } from ".";
import type { Canvas, Info } from "../skia/Canvas";

declare global {
  var invalidateSkiaView: (nativeId: number) => void;
  var setDrawCallback: (nativeId: number, callback: RNSkiaDrawCallback) => void;
  var unsetDrawCallback: (nativeId: number) => void;
}

export type NativeSkiaViewProps = ViewProps & {
  mode?: "continuous" | "default";
  debug?: boolean;
};

export type RNSkiaDrawCallback = (canvas: Canvas, info: Info) => void;

export type RNSkiaViewProps = ViewProps & {
  mode?: "continuous" | "default";
  debug?: boolean;
  onDraw?: RNSkiaDrawCallback;
};

export const NativeSkiaView = requireNativeComponent<NativeSkiaViewProps>(
  "ReactNativeSkiaView"
);
