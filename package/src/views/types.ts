import type { ViewProps } from "react-native";

import type { SkCanvas } from "../skia/Canvas";

export type DrawMode = "continuous" | "default";

export type NativeSkiaViewProps = ViewProps & {
  mode?: DrawMode;
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

export type ExtendedTouchInfo = TouchInfo & {
  // points per second
  velocityX: number;
  velocityY: number;
};

export type TouchHandlers = {
  onStart?: (touchInfo: TouchInfo) => void;
  onActive?: (touchInfo: ExtendedTouchInfo) => void;
  onEnd?: (touchInfo: ExtendedTouchInfo) => void;
};

export type TouchHandler = (touchInfo: Array<Array<TouchInfo>>) => void;

export type RNSkiaDrawCallback = (canvas: SkCanvas, info: DrawingInfo) => void;

/**
 * Listener interface for value changes
 */
export interface ValueListener {
  addListener: (callback: () => void) => number;
  removeListener: (id: number) => void;
}
