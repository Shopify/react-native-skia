import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import type { LayoutChangeEvent, ViewProps } from "react-native";

import { Platform } from "../Platform";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
import type { SkPicture } from "../skia/types";

import { SkiaViewNativeId } from "./SkiaViewNativeId";

const pd = Platform.PixelRatio;

class SkiaContext {
  private _surface: JsiSkSurface | null = null;

  setSurface(surface: JsiSkSurface) {
    this._surface = surface;
  }

  get size() {
    if (!this._surface) {
      throw new Error("Surface is not initialized");
    }
    return {
      width: this._surface.width(),
      height: this._surface.height(),
    };
  }

  get canvas() {
    if (!this._surface) {
      throw new Error("Surface is not initialized");
    }
    return this._surface.getCanvas();
  }
}

const useAnimatedFrame = (callback: () => void) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      callbackRef.current();
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
};

const useLazyRef = <T,>(fn: () => T) => {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = fn();
  }
  return ref.current;
};

const SkiaContextRegistry = new Map<number, SkiaContext>();

interface NativeCanvasProps extends ViewProps {
  nativeId: number;
}

const NativeCanvas = ({ nativeId, ...viewProps }: NativeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      throw new Error("Canvas ref is null");
    }
    return () => {
      canvas
        .getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext();
    };
  });
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { CanvasKit } = global;
      // Reset canvas / surface on layout change
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.clientWidth * pd;
        canvas.height = canvas.clientHeight * pd;
        const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
        if (!surface) {
          throw new Error("Could not create surface");
        }
        const skiaSurface = new JsiSkSurface(CanvasKit, surface);
        if (!skiaSurface) {
          throw new Error("Could not create Skia surface");
        }
        if (!SkiaContextRegistry.has(nativeId)) {
          SkiaContextRegistry.set(nativeId, new SkiaContext());
        }
        SkiaContextRegistry.get(nativeId)!.setSurface(skiaSurface);
      }
      // Call onLayout callback if it exists
      if (viewProps.onLayout) {
        viewProps.onLayout(e);
      }
    },
    [nativeId, viewProps]
  );
  return (
    <Platform.View {...viewProps} onLayout={onLayout}>
      <canvas ref={canvasRef} style={{ display: "flex", flex: 1 }} />
    </Platform.View>
  );
};

interface SkiaCanvasProps {}

const SkiaCanvas = forwardRef((_props: SkiaCanvasProps, ref) => {
  const nativeId = useLazyRef(() => SkiaViewNativeId.current++);
  useImperativeHandle(
    ref,
    () => {
      return {
        getSkiaContext: () => {
          return SkiaContextRegistry.get(nativeId);
        },
      };
    },
    [nativeId]
  );
  return <NativeCanvas nativeId={nativeId} />;
});

interface SkiaPictureProps extends ViewProps {
  picture: SkPicture;
}

// 1. Can we do off thread rendering here?
export const SkiaPicture = ({ picture, ...viewProps }: SkiaPictureProps) => {
  const ref = useRef<{
    getSkiaContext: () => SkiaContext | undefined;
  } | null>(null);
  const lastSize = useRef({ width: -1, height: -1 });
  useEffect(() => {
    lastSize.current = { width: -1, height: -1 };
  }, [picture]);
  const draw = useCallback(() => {
    if (ref.current === null) {
      throw new Error("SkiaContext is not initialized");
    }
    const ctx = ref.current.getSkiaContext();
    if (ctx === undefined) {
      throw new Error("SkiaContext is undefined");
    }
    if (
      lastSize.current.width === ctx.size.width &&
      lastSize.current.height === ctx.size.height
    ) {
      return;
    }
    ctx.canvas.clear(Float32Array.of(0, 0, 0, 0));
    ctx.canvas.save();
    ctx.canvas.scale(pd, pd);
    ctx.canvas.drawPicture(picture);
    ctx.canvas.restore();
    lastSize.current = ctx.size;
  }, [picture]);
  useAnimatedFrame(draw);
  return <SkiaCanvas ref={ref} {...viewProps} />;
};
