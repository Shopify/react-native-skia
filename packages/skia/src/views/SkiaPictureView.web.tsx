/* global HTMLCanvasElement */
import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import type { LayoutChangeEvent } from "react-native";
import type { GrDirectContext, WebGLContextHandle } from "canvaskit-wasm";

import type { SkRect, SkPicture, SkImage } from "../skia/types";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
import { Platform } from "../Platform";
import type { ISkiaViewApiWeb } from "../specs/NativeSkiaModule.web";

import type { SkiaPictureViewNativeProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

const dp2Pixel = (pd: number, rect?: SkRect) => {
  if (!rect) {
    return undefined;
  }
  return {
    x: rect.x * pd,
    y: rect.y * pd,
    width: rect.width * pd,
    height: rect.height * pd,
  };
};

interface Renderer {
  onResize(): void;
  draw(picture: SkPicture): void;
  makeImageSnapshot(picture: SkPicture, rect?: SkRect): SkImage | null;
  dispose(): void;
}

class WebGLRenderer implements Renderer {
  private surface: JsiSkSurface | null = null;
  private grContext: GrDirectContext | null = null;
  private contextHandle: WebGLContextHandle = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private pd: number
  ) {
    this.contextHandle = CanvasKit.GetWebGLContext(canvas);
    if (!this.contextHandle) {
      throw new Error("Could not create a WebGL context");
    }
    this.grContext = CanvasKit.MakeWebGLContext(this.contextHandle);
    if (!this.grContext) {
      CanvasKit.deleteContext(this.contextHandle);
      this.contextHandle = 0;
      throw new Error("Could not create a graphics context");
    }
    const ctx = canvas.getContext("webgl2");
    if (ctx) {
      ctx.drawingBufferColorSpace = "display-p3";
    }
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
    return this.surface.makeImageSnapshot(dp2Pixel(this.pd, rect));
  }

  onResize() {
    const { canvas, pd } = this;
    if (!this.grContext) {
      return;
    }
    canvas.width = canvas.clientWidth * pd;
    canvas.height = canvas.clientHeight * pd;
    this.surface?.ref.delete();
    this.surface = null;
    // Reuse the existing WebGL context and GrDirectContext: only the surface
    // needs to be recreated when the canvas is resized.
    const surface = CanvasKit.MakeOnScreenGLSurface(
      this.grContext,
      canvas.width,
      canvas.height,
      CanvasKit.ColorSpace.SRGB
    );
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
    this.surface?.ref.delete();
    this.surface = null;
    if (this.grContext) {
      this.grContext.releaseResourcesAndAbandonContext();
      this.grContext.delete();
      this.grContext = null;
    }
    this.canvas
      ?.getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
    if (this.contextHandle) {
      // Unregister the context from CanvasKit's internal registry, otherwise
      // it retains the canvas element (and its detached DOM tree) forever.
      CanvasKit.deleteContext(this.contextHandle);
      // Making the now-deleted handle current clears CanvasKit's
      // current-context globals (GLctx/Module.ctx), which would otherwise
      // keep referencing the context (and the canvas) until another surface
      // becomes current. With a deleted handle this is a no-op that returns
      // null without creating anything.
      CanvasKit.MakeWebGLContext(this.contextHandle);
      this.contextHandle = 0;
    }
  }
}

interface TempRenderResult {
  surface: JsiSkSurface;
  tempCanvas: OffscreenCanvas;
  grContext: GrDirectContext;
  contextHandle: WebGLContextHandle;
}

class StaticWebGLRenderer implements Renderer {
  private cachedImage: SkImage | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private pd: number
  ) {}

  onResize(): void {
    this.cachedImage = null;
  }

  private renderPictureToSurface(picture: SkPicture): TempRenderResult | null {
    const tempCanvas = new OffscreenCanvas(
      this.canvas.clientWidth * this.pd,
      this.canvas.clientHeight * this.pd
    );

    let surface: JsiSkSurface | null = null;
    let grContext: GrDirectContext | null = null;
    let contextHandle: WebGLContextHandle = 0;

    try {
      contextHandle = CanvasKit.GetWebGLContext(tempCanvas);
      if (!contextHandle) {
        throw new Error("Could not create a WebGL context");
      }
      grContext = CanvasKit.MakeWebGLContext(contextHandle);
      if (!grContext) {
        throw new Error("Could not create a graphics context");
      }
      const ctx = tempCanvas.getContext("webgl2");
      if (ctx) {
        ctx.drawingBufferColorSpace = "display-p3";
      }
      const webglSurface = CanvasKit.MakeOnScreenGLSurface(
        grContext,
        tempCanvas.width,
        tempCanvas.height,
        CanvasKit.ColorSpace.SRGB
      );

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

      return { surface, tempCanvas, grContext, contextHandle };
    } catch (error) {
      this.cleanupRenderResult({
        surface,
        tempCanvas,
        grContext,
        contextHandle,
      });
      return null;
    }
  }

  private cleanupRenderResult(result: {
    surface: JsiSkSurface | null;
    tempCanvas: OffscreenCanvas;
    grContext: GrDirectContext | null;
    contextHandle: WebGLContextHandle;
  }): void {
    result.surface?.ref.delete();
    if (result.grContext) {
      result.grContext.releaseResourcesAndAbandonContext();
      result.grContext.delete();
    }
    result.tempCanvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
    if (result.contextHandle) {
      // Unregister the context from CanvasKit's internal registry, otherwise
      // it retains the OffscreenCanvas forever.
      CanvasKit.deleteContext(result.contextHandle);
      // Clear CanvasKit's current-context globals (see WebGLRenderer.dispose).
      CanvasKit.MakeWebGLContext(result.contextHandle);
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
      this.cleanupRenderResult(renderResult);
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

    this.cleanupRenderResult(renderResult);
  }

  makeImageSnapshot(picture: SkPicture, rect?: SkRect): SkImage | null {
    if (!this.cachedImage) {
      const renderResult = this.renderPictureToSurface(picture);
      if (!renderResult) {
        return null;
      }

      try {
        this.cachedImage = renderResult.surface.makeImageSnapshot(
          dp2Pixel(this.pd, rect)
        );
      } catch (error) {
        console.error("Error creating image snapshot:", error);
      } finally {
        this.cleanupRenderResult(renderResult);
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
  measure(
    callback: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number
    ) => void
  ): void;
  measureInWindow(
    callback: (x: number, y: number, width: number, height: number) => void
  ): void;
}

export interface SkiaPictureViewProps extends SkiaPictureViewNativeProps {
  ref?: React.Ref<SkiaPictureViewHandle>;
}

export const SkiaPictureView = (props: SkiaPictureViewProps) => {
  const { ref } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRef<Renderer | null>(null);
  const rendererIsStatic = useRef<boolean | null>(null);
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

  const measure = useCallback(
    (
      callback: (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => void
    ) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const parentElement = canvasRef.current.offsetParent as HTMLElement;
        const parentRect = parentElement?.getBoundingClientRect() || {
          left: 0,
          top: 0,
        };

        // x, y are relative to the parent
        const x = rect.left - parentRect.left;
        const y = rect.top - parentRect.top;

        // pageX, pageY are absolute screen coordinates
        const pageX = rect.left + window.scrollX;
        const pageY = rect.top + window.scrollY;

        callback(x, y, rect.width, rect.height, pageX, pageY);
      }
    },
    []
  );

  const measureInWindow = useCallback(
    (
      callback: (x: number, y: number, width: number, height: number) => void
    ) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        // x, y are the absolute coordinates in the window
        const x = rect.left;
        const y = rect.top;

        callback(x, y, rect.width, rect.height);
      }
    },
    []
  );

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
        const destroyAfterRender =
          props.__destroyWebGLContextAfterRender === true;
        if (
          renderer.current === null ||
          rendererIsStatic.current !== destroyAfterRender
        ) {
          renderer.current?.dispose();
          renderer.current = destroyAfterRender
            ? new StaticWebGLRenderer(canvas, pd)
            : new WebGLRenderer(canvas, pd);
          rendererIsStatic.current = destroyAfterRender;
        } else {
          // Reuse the existing renderer (and its WebGL context) on relayout.
          renderer.current.onResize();
        }
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
      measure,
      measureInWindow,
      get canvasRef() {
        return () => canvasRef.current;
      },
    }),
    [setPicture, getSize, redraw, makeImageSnapshot, measure, measureInWindow]
  );

  useEffect(() => {
    const nativeID = props.nativeID ?? `${SkiaViewNativeId.current++}`;
    const api = global.SkiaViewApi as ISkiaViewApiWeb;
    api.registerView(nativeID, {
      setPicture,
      getSize,
      redraw,
      makeImageSnapshot,
      measure,
      measureInWindow,
    } as SkiaPictureViewHandle);
    return () => {
      api.unregisterView(nativeID);
    };
  }, [
    setPicture,
    getSize,
    redraw,
    makeImageSnapshot,
    measure,
    measureInWindow,
    props.nativeID,
  ]);

  useEffect(() => {
    if (props.picture) {
      setPicture(props.picture);
    }
  }, [setPicture, props.picture]);

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

  const { debug = false, ref: _ref, ...viewProps } = props;
  return (
    <Platform.View {...viewProps} onLayout={onLayoutEvent}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </Platform.View>
  );
};
