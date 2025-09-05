/* global HTMLCanvasElement */
import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { LayoutChangeEvent } from "react-native";

import type { SkRect, SkPicture, SkImage } from "../skia/types";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
import { Platform } from "../Platform";
import type { ISkiaViewApiWeb } from "../specs/NativeSkiaModule.web";

import type { SkiaPictureViewNativeProps } from "./types";

interface Renderer {
  onResize(): void;
  draw(picture: SkPicture): void;
  makeImageSnapshot(picture: SkPicture, rect?: SkRect): SkImage | null;
  dispose(): void;
}

class WebGPURender implements Renderer {
  private surface: JsiSkSurface | null = null;

  constructor(private canvas: HTMLCanvasElement, private pd: number) {
    this.onResize();
  }

  makeImageSnapshot(picture: SkPicture, rect?: SkRect): SkImage | null {
    if (!this.surface) {
      return null;
    }
    const canvas = this.surface.getCanvas();
    canvas!.clear(CanvasKit.TRANSPARENT);
    this.draw(picture);
    this.surface.ref.flush();
    return this.surface.makeImageSnapshot(rect);
  }

  onResize() {
    const { canvas, pd } = this;
    canvas.width = canvas.clientWidth * pd;
    canvas.height = canvas.clientHeight * pd;
    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
    const ctx = canvas.getContext("webgl2");
    if (ctx) {
      ctx.drawingBufferColorSpace = "display-p3";
    }
    if (!surface) {
      throw new Error("Could not create surface");
    }
    this.surface = new JsiSkSurface(CanvasKit, surface);
  }

  draw(picture: SkPicture) {
    if (this.surface) {
      const canvas = this.surface.getCanvas();
      canvas.clear(Float32Array.of(0, 0, 0, 0));
      canvas.save();
      canvas.scale(pd, pd);
      canvas.drawPicture(picture);
      canvas.restore();
      this.surface.ref.flush();
    }
  }

  dispose(): void {
    if (this.surface) {
      this.canvas
        ?.getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext();
      this.surface.ref.delete();
      this.surface = null;
    }
  }
}

const pd = Platform.PixelRatio;

export interface SkiaPictureViewHandle {
  setPicture(picture: SkPicture): void;
  getSize(): { width: number; height: number };
  redraw(): void;
  makeImageSnapshot(rect?: SkRect): SkImage | null;
}

export const SkiaPictureView = forwardRef<
  SkiaPictureViewHandle,
  SkiaPictureViewNativeProps
>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRef<Renderer | null>(null);
  const redrawRequestsRef = useRef(0);
  const requestIdRef = useRef(0);
  const pictureRef = useRef<SkPicture | null>(null);

  const { nativeID, picture, onLayout } = props;
  if (!nativeID) {
    throw new Error("SkiaPictureView requires a nativeID prop");
  }

  const redraw = useCallback(() => {
    redrawRequestsRef.current++;
  }, []);

  const getSize = useCallback(() => {
    return {
      width: canvasRef.current?.clientWidth || 0,
      height: canvasRef.current?.clientHeight || 0,
    };
  }, []);

  const setPicture = useCallback(
    (newPicture: SkPicture) => {
      pictureRef.current = newPicture;
      redraw();
    },
    [redraw]
  );

  const makeImageSnapshot = useCallback((rect?: SkRect) => {
    if (renderer.current && pictureRef.current) {
      return renderer.current.makeImageSnapshot(pictureRef.current, rect);
    }
    return null;
  }, []);

  const tick = useCallback(() => {
    if (redrawRequestsRef.current > 0) {
      redrawRequestsRef.current = 0;
      if (renderer.current && pictureRef.current) {
        renderer.current.draw(pictureRef.current);
      }
    }
    requestIdRef.current = requestAnimationFrame(tick);
  }, []);

  const onLayoutEvent = useCallback(
    (evt: LayoutChangeEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        renderer.current = new WebGPURender(canvas, pd);
        if (pictureRef.current) {
          renderer.current.draw(pictureRef.current);
        }
      }
      if (onLayout) {
        onLayout(evt);
      }
    },
    [onLayout]
  );

  useImperativeHandle(
    ref,
    () => ({
      setPicture,
      getSize,
      redraw,
      makeImageSnapshot,
    }),
    [setPicture, getSize, redraw, makeImageSnapshot]
  );

  useEffect(() => {
    (global.SkiaViewApi as ISkiaViewApiWeb).registerView(nativeID, {
      setPicture,
      getSize,
      redraw,
      makeImageSnapshot,
    } as SkiaPictureViewHandle);
  }, [nativeID, setPicture, getSize, redraw, makeImageSnapshot]);

  useEffect(() => {
    tick();
    return () => {
      cancelAnimationFrame(requestIdRef.current);
      if (renderer.current) {
        renderer.current.dispose();
        renderer.current = null;
      }
    };
  }, [tick]);

  useEffect(() => {
    if (renderer.current && pictureRef.current) {
      renderer.current.draw(pictureRef.current);
    }
  }, [picture, redraw]);

  const { debug = false, ...viewProps } = props;
  return (
    <Platform.View {...viewProps} onLayout={onLayoutEvent}>
      <canvas ref={canvasRef} style={{ display: "flex", flex: 1 }} />
    </Platform.View>
  );
});
