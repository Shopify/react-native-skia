import React from "react";
import type { ViewProps } from "react-native";

export interface NativeCanvas {
  surface: bigint;
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
}

export type RNCanvasContext = GPUCanvasContext & {
  present: () => void;
};

export interface WebGPUCanvasRef {
  getContextId: () => number;
  getContext(contextName: "webgpu"): RNCanvasContext | null;
  getNativeSurface: () => NativeCanvas;
}

interface WebGPUCanvasProps extends ViewProps {
  transparent?: boolean;
  ref?: React.Ref<WebGPUCanvasRef>;
}

// WebGPU Canvas is not supported on web
export const WebGPUCanvas = ({
  transparent: _transparent,
  ref: _ref,
  ...props
}: WebGPUCanvasProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <div {...props} />;
};
