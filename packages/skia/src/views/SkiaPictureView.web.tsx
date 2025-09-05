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
import { SkiaViewNativeId } from "./SkiaViewNativeId";

interface Renderer {
  onResize(): void;
  draw(picture: SkPicture): void;
  makeImageSnapshot(picture: SkPicture, rect?: SkRect): SkImage | null;
  dispose(): void;
}

class WebGLRenderer implements Renderer {
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

class StaticWebGLRenderer implements Renderer {
  private cachedImage: SkImage | null = null;

  constructor(private canvas: HTMLCanvasElement, private pd: number) {}

  onResize(): void {
    this.cachedImage = null;
  }

  private renderPictureToSurface(
    picture: SkPicture
  ): { surface: JsiSkSurface; tempCanvas: OffscreenCanvas } | null {
    const tempCanvas = new OffscreenCanvas(
      this.canvas.clientWidth * this.pd,
      this.canvas.clientHeight * this.pd
    );

    let surface: JsiSkSurface | null = null;

    try {
      const webglSurface = CanvasKit.MakeWebGLCanvasSurface(tempCanvas);
      const ctx = tempCanvas.getContext("webgl2");
      if (ctx) {
        ctx.drawingBufferColorSpace = "display-p3";
      }

      if (!webglSurface) {
        throw new Error("Could not create WebGL surface");
      }

      surface = new JsiSkSurface(CanvasKit, webglSurface);

      const skiaCanvas = surface.getCanvas();
      skiaCanvas.clear(Float32Array.of(0, 0, 0, 0));
      skiaCanvas.save();
      skiaCanvas.scale(this.pd, this.pd);
      skiaCanvas.drawPicture(picture);
      skiaCanvas.restore();
      surface.ref.flush();

      return { surface, tempCanvas };
    } catch (error) {
      if (surface) {
        surface.ref.delete();
      }
      this.cleanupWebGLContext(tempCanvas);
      return null;
    }
  }

  private cleanupWebGLContext(tempCanvas: OffscreenCanvas): void {
    const ctx = tempCanvas.getContext("webgl2");
    if (ctx) {
      const loseContext = ctx.getExtension("WEBGL_lose_context");
      if (loseContext) {
        loseContext.loseContext();
      }
    }
  }

  draw(picture: SkPicture): void {
    const renderResult = this.renderPictureToSurface(picture);
    if (!renderResult) {
      return;
    }
    const { tempCanvas } = renderResult;
    const ctx2d = this.canvas.getContext("2d");
    if (!ctx2d) {
      throw new Error("Could not get 2D context");
    }

    // Set canvas dimensions to match pixel density
    this.canvas.width = this.canvas.clientWidth * this.pd;
    this.canvas.height = this.canvas.clientHeight * this.pd;

    // Draw the tempCanvas scaled down to the display size
    ctx2d.drawImage(
      tempCanvas,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
      0,
      0,
      this.canvas.clientWidth * this.pd,
      this.canvas.clientHeight * this.pd
    );

    this.cleanupWebGLContext(tempCanvas);
  }

  makeImageSnapshot(picture: SkPicture, rect?: SkRect): SkImage | null {
    if (!this.cachedImage) {
      const renderResult = this.renderPictureToSurface(picture);
      if (!renderResult) {
        return null;
      }

      const { surface, tempCanvas } = renderResult;

      try {
        this.cachedImage = surface.makeImageSnapshot(rect);
      } catch (error) {
        console.error("Error creating image snapshot:", error);
      } finally {
        surface.ref.delete();
        this.cleanupWebGLContext(tempCanvas);
      }
    }

    return this.cachedImage;
  }

  dispose(): void {
    this.cachedImage?.dispose();
    this.cachedImage = null;
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

  const { picture, onLayout } = props;

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
        renderer.current =
          props.__destroyWebGLContextAfterRender === true
            ? new StaticWebGLRenderer(canvas, pd)
            : new WebGLRenderer(canvas, pd);
        if (pictureRef.current) {
          renderer.current.draw(pictureRef.current);
        }
      }
      if (onLayout) {
        onLayout(evt);
      }
    },
    [onLayout, props.__destroyWebGLContextAfterRender]
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
    const nativeID = props.nativeID ?? `${SkiaViewNativeId.current++}`;
    (global.SkiaViewApi as ISkiaViewApiWeb).registerView(nativeID, {
      setPicture,
      getSize,
      redraw,
      makeImageSnapshot,
    } as SkiaPictureViewHandle);
    if (props.picture) {
      setPicture(props.picture);
    }
  }, [setPicture, getSize, redraw, makeImageSnapshot, props]);

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
