import type { CanvasKit } from "canvaskit-wasm";

import type {
  SkContourMeasureIter,
  Skia,
  SkPath,
  SkRect,
  SkRuntimeEffect,
  SkRuntimeShaderBuilder,
} from "../../types";

import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkRect } from "./JsiSkRect";
import { Color } from "./JsiSkColor";
import { JsiSkSurfaceFactory } from "./JsiSkSurfaceFactory";
import { JsiSkRRect } from "./JsiSkRRect";
import { JsiSkRSXform } from "./JsiSkRSXform";
import { toValue } from "./Host";
import { JsiSkContourMeasureIter } from "./JsiSkContourMeasureIter";
import { JsiSkPictureRecorder } from "./JsiSkPictureRecorder";

export const JsiSkApi: Skia = (CanvasKit: CanvasKit) => ({
  Point: (x: number, y: number) =>
    new JsiSkPoint(CanvasKit, Float32Array.of(x, y)),
  RuntimeShaderBuilder: (_: SkRuntimeEffect): SkRuntimeShaderBuilder => {
    throw new Error("Not implemented on React Native Web");
  },
  RRectXY: (rect: SkRect, rx: number, ry: number) =>
    new JsiSkRRect(CanvasKit, CanvasKit.RRectXY(toValue(rect), rx, ry)),
  RSXform: (scos: number, ssin: number, tx: number, ty: number) =>
    new JsiSkRSXform(CanvasKit, Float32Array.of(scos, ssin, tx, ty)),
  Color: Color.bind(null, CanvasKit),
  ContourMeasureIter: (
    path: SkPath,
    forceClosed: boolean,
    resScale: number
  ): SkContourMeasureIter =>
    new JsiSkContourMeasureIter(
      CanvasKit,
      new CanvasKit.ContourMeasureIter(toValue(path), forceClosed, resScale)
    ),
  Paint: () => new JsiSkPaint(CanvasKit, new CanvasKit.Paint()),
  PictureRecorder: () => new JsiSkPictureRecorder(CanvasKit, new CanvasKit.PictureRecorder());
  XYWHRect: (x: number, y: number, width: number, height: number) => {
    return new JsiSkRect(CanvasKit, CanvasKit.XYWHRect(x, y, width, height));
  },
  Surface: new JsiSkSurfaceFactory(CanvasKit),
});
