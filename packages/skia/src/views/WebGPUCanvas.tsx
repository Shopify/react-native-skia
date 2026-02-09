import React, { useImperativeHandle, useRef, useState } from "react";
import type { ViewProps } from "react-native";
import { View, Platform } from "react-native";

import WebGPUNativeView from "../specs/WebGPUViewNativeComponent";

let CONTEXT_COUNTER = 1;
function generateContextId() {
  return CONTEXT_COUNTER++;
}

declare global {
  // eslint-disable-next-line no-var
  var RNWebGPU: {
    gpu: GPU;
    fabric: boolean;
    getNativeSurface: (contextId: number) => NativeCanvas;
    MakeWebGPUCanvasContext: (
      contextId: number,
      width: number,
      height: number
    ) => RNCanvasContext;
  };
}

type SurfacePointer = bigint;

export interface NativeCanvas {
  surface: SurfacePointer;
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

export const WebGPUCanvas = ({
  transparent,
  ref,
  ...props
}: WebGPUCanvasProps) => {
  const viewRef = useRef(null);
  const [contextId] = useState(() => generateContextId());

  useImperativeHandle(ref, () => ({
    getContextId: () => contextId,
    getNativeSurface: () => {
      if (typeof RNWebGPU === "undefined") {
        throw new Error(
          "[WebGPU] RNWebGPU is not available. Make sure SK_GRAPHITE is enabled."
        );
      }
      return RNWebGPU.getNativeSurface(contextId);
    },
    getContext(contextName: "webgpu"): RNCanvasContext | null {
      if (contextName !== "webgpu") {
        throw new Error(`[WebGPU] Unsupported context: ${contextName}`);
      }
      if (!viewRef.current) {
        throw new Error("[WebGPU] Cannot get context before mount");
      }
      if (typeof RNWebGPU === "undefined") {
        throw new Error(
          "[WebGPU] RNWebGPU is not available. Make sure SK_GRAPHITE is enabled."
        );
      }
      // getBoundingClientRect became stable in RN 0.83
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const view = viewRef.current as any;
      const size =
        "getBoundingClientRect" in view
          ? view.getBoundingClientRect()
          : view.unstable_getBoundingClientRect();
      return RNWebGPU.MakeWebGPUCanvasContext(
        contextId,
        size.width,
        size.height
      );
    },
  }));

  // WebGPU Canvas is not supported on web
  if (Platform.OS === "web") {
    return <View {...props} />;
  }

  return (
    <View collapsable={false} ref={viewRef} {...props}>
      <WebGPUNativeView
        style={{ flex: 1 }}
        contextId={contextId}
        transparent={!!transparent}
      />
    </View>
  );
};
