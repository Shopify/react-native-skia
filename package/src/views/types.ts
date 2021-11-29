import type { ViewProps } from "react-native";
import { requireNativeComponent } from "react-native";

import type { ICanvas } from "../skia/Canvas";

export interface ISkiaViewApi {
  invalidateSkiaView: (nativeId: number) => void;
  setDrawCallback: (
    nativeId: number,
    callback: RNSkiaDrawCallback | undefined
  ) => void;
}
declare global {
  var SkiaViewApi: ISkiaViewApi;
}

export const { SkiaViewApi } = global;

export type NativeSkiaViewProps = ViewProps & {
  mode?: "continuous" | "default";
  debug?: boolean;
};

export enum TouchType {
  Start,
  Active,
  End,
  Cancelled,
}

export interface TouchInfo {
  x: number;
  y: number;
  force: number;
  type: TouchType;
  timestamp: number;
}

export interface DrawingInfo {
  width: number;
  height: number;
  timestamp: number;
  touches: Array<Array<TouchInfo>>;
}

export type RNSkiaDrawCallback = (canvas: ICanvas, info: DrawingInfo) => void;
export type RNSkiaTouchCallback = (touches: TouchInfo[]) => void;

export type RNSkiaViewProps = ViewProps & {
  mode?: "continuous" | "default";
  debug?: boolean;
  onDraw?: RNSkiaDrawCallback;
  onTouch?: RNSkiaTouchCallback;
};

export const NativeSkiaView = requireNativeComponent<NativeSkiaViewProps>(
  "ReactNativeSkiaView"
);
