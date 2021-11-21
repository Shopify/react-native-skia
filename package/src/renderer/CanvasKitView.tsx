/*global NodeJS, performance*/
import type { Canvas, Surface, Paint, CanvasKit } from "canvaskit-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import { continueRender, useVideoConfig } from "remotion";

import { useCanvasKit, useRendering } from "./CanvasKitProvider";

export interface DrawingContext {
  CanvasKit: CanvasKit;
  canvas: Canvas;
  paint: Paint;
  opacity: number;
}

interface Skia {
  surface: Surface;
  canvas: Canvas;
}

type DrawCallback = (CanvasKit: CanvasKit, canvas: Canvas) => void;

interface CanvasKitViewProps {
  onDraw: DrawCallback;
}

export const useDrawCallback = (
  cb: DrawCallback,
  deps: Parameters<typeof useCallback>[1]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useCallback(cb, deps);

export const CanvasKitView = ({ onDraw }: CanvasKitViewProps) => {
  const { width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const [skia, setSkia] = useState<Skia | null>(null);
  const CanvasKit = useCanvasKit();
  const handle = useRendering();
  useEffect(() => {
    if (CanvasKit && ref.current) {
      const surface = CanvasKit.MakeCanvasSurface(ref.current);
      if (!surface) {
        throw "Could not make surface";
      }
      setSkia({
        surface,
        canvas: surface.getCanvas(),
      });
    }
  }, [CanvasKit]);

  useEffect(() => {
    if (!CanvasKit || !skia) {
      return;
    }
    const { canvas, surface } = skia;
    const t0 = performance.now();
    onDraw(CanvasKit, canvas);
    surface.flush();
    const t1 = performance.now();
    console.log("time to draw", Math.round((t1 - t0) * 10) / 10);
    continueRender(handle);
  }, [CanvasKit, handle, onDraw, skia]);
  return <canvas ref={ref} width={width} height={height} />;
};
