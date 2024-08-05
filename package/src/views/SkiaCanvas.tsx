import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import type { ViewProps } from "react-native";

import type { SkSurface } from "../skia";
import SkiaNativeView from "../specs/SkiaViewNativeComponent";
import SkiaNativeModule from "../specs/NativeSkiaModule";

let CONTEXT_COUNTER = 1;
function generateContextId() {
  return CONTEXT_COUNTER++;
}

declare global {
  var __SkiaContextRegistry: Record<number, SkSurface>;
}

global.__SkiaContextRegistry = {};
const SkiaContextRegistry = global.__SkiaContextRegistry;

export interface CanvasRef {
  getContext(contextName: "skia"): SkSurface | null;
}

export const Canvas = forwardRef<CanvasRef, ViewProps>((props, ref) => {
  const [contextId, _] = useState(() => generateContextId());

  useImperativeHandle(ref, () => ({
    getContext(contextName: "skia"): SkSurface | null {
      if (contextName !== "skia") {
        throw new Error(`Unsupported context: ${contextName}`);
      }
      SkiaNativeModule.createSurfaceContext(contextId);
      const ctx = (SkiaContextRegistry[contextId] as SkSurface) ?? null;
      return ctx;
    },
  }));

  useEffect(() => {
    return () => {
      delete SkiaContextRegistry[contextId];
    };
  }, [contextId]);

  return <SkiaNativeView {...props} contextId={contextId} />;
});
