/* global HTMLCanvasElement */
import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { LayoutChangeEvent } from "react-native";

import type { SkRect, SkCanvas, SkPicture, SkImage } from "../skia/types";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
import { Platform } from "../Platform";
import type { ISkiaViewApiWeb } from "../specs/NativeSkiaModule.web";

import type { SkiaPictureViewNativeProps } from "./types";

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
  const surfaceRef = useRef<JsiSkSurface | null>(null);
  const unsubscriptionsRef = useRef<Array<() => void>>([]);
  const canvasRef = useRef<SkCanvas | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const redrawRequestsRef = useRef(0);
  const requestIdRef = useRef(0);
  const pictureRef = useRef<SkPicture | null>(null);

  const widthRef = useRef(0);
  const heightRef = useRef(0);

  const { nativeID, picture, onLayout } = props;
  if (!nativeID) {
    throw new Error("SkiaPictureView requires a nativeID prop");
  }

  const unsubscribeAll = useCallback(() => {
    unsubscriptionsRef.current.forEach((u) => u());
    unsubscriptionsRef.current = [];
  }, []);

  const renderInCanvas = useCallback(
    (canvas: SkCanvas) => {
      if (picture) {
        canvas.drawPicture(picture);
      } else if (pictureRef.current) {
        canvas.drawPicture(pictureRef.current);
      }
    },
    [picture]
  );

  const redraw = useCallback(() => {
    redrawRequestsRef.current++;
  }, []);

  const getSize = useCallback(() => {
    return { width: widthRef.current, height: heightRef.current };
  }, []);

  const setPicture = useCallback(
    (newPicture: SkPicture) => {
      pictureRef.current = newPicture;
      redraw();
    },
    [redraw]
  );

  const makeImageSnapshot = useCallback(
    (rect?: SkRect) => {
      canvasRef.current!.clear(CanvasKit.TRANSPARENT);
      renderInCanvas(canvasRef.current!);
      surfaceRef.current?.ref.flush();
      return surfaceRef.current?.makeImageSnapshot(rect);
    },
    [renderInCanvas]
  );

  const tick = useCallback(() => {
    if (redrawRequestsRef.current > 0) {
      redrawRequestsRef.current = 0;
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.clear(Float32Array.of(0, 0, 0, 0));
        canvas.save();
        canvas.scale(pd, pd);
        renderInCanvas(canvas);
        canvas.restore();
        surfaceRef.current?.ref.flush();
      }
    }
    requestIdRef.current = requestAnimationFrame(tick);
  }, [renderInCanvas]);

  const onLayoutEvent = useCallback(
    (evt: LayoutChangeEvent) => {
      const { CanvasKit } = global;
      const canvas = canvasElementRef.current;
      if (canvas) {
        widthRef.current = canvas.clientWidth;
        heightRef.current = canvas.clientHeight;
        canvas.width = widthRef.current * pd;
        canvas.height = heightRef.current * pd;
        const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
        const ctx = canvas.getContext("webgl2");
        if (ctx) {
          ctx.drawingBufferColorSpace = "display-p3";
        }
        if (!surface) {
          throw new Error("Could not create surface");
        }
        surfaceRef.current = new JsiSkSurface(CanvasKit, surface);
        canvasRef.current = surfaceRef.current.getCanvas();
        redraw();
      }
      if (onLayout) {
        onLayout(evt);
      }
    },
    [onLayout, redraw]
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
    const currentCanvasElement = canvasElementRef.current;
    tick();
    return () => {
      unsubscribeAll();
      cancelAnimationFrame(requestIdRef.current);
      if (surfaceRef.current) {
        currentCanvasElement
          ?.getContext("webgl2")
          ?.getExtension("WEBGL_lose_context")
          ?.loseContext();
      }
    };
  }, [tick, unsubscribeAll]);

  useEffect(() => {
    redraw();
  }, [picture, redraw]);

  const { debug = false, ...viewProps } = props;
  return (
    <Platform.View {...viewProps} onLayout={onLayoutEvent}>
      <canvas ref={canvasElementRef} style={{ display: "flex", flex: 1 }} />
    </Platform.View>
  );
});
