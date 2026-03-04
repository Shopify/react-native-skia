import type { CanvasKit, Matrix3x3, Path } from "canvaskit-wasm";

import type {
  FillType,
  InputMatrix,
  InputRRect,
  SkMatrix,
  SkPath,
  SkPathBuilder,
  SkPoint,
  SkRect,
} from "../types";

import { getEnum, HostObject } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkRRect } from "./JsiSkRRect";

/**
 * Web implementation of SkPathBuilder.
 * CanvasKit doesn't have a separate PathBuilder, so we use Path directly
 * and create a copy when build() is called.
 */
export class JsiSkPathBuilder
  extends HostObject<Path, "PathBuilder">
  implements SkPathBuilder
{
  constructor(CanvasKit: CanvasKit, ref: Path) {
    super(CanvasKit, ref, "PathBuilder");
  }

  // Movement methods
  moveTo(x: number, y: number) {
    this.ref.moveTo(x, y);
    return this;
  }

  rMoveTo(x: number, y: number) {
    this.ref.rMoveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number) {
    this.ref.lineTo(x, y);
    return this;
  }

  rLineTo(x: number, y: number) {
    this.ref.rLineTo(x, y);
    return this;
  }

  // Curve methods
  quadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.quadTo(x1, y1, x2, y2);
    return this;
  }

  rQuadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.rQuadTo(x1, y1, x2, y2);
    return this;
  }

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.conicTo(x1, y1, x2, y2, w);
    return this;
  }

  rConicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.rConicTo(x1, y1, x2, y2, w);
    return this;
  }

  cubicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) {
    this.ref.cubicTo(x1, y1, x2, y2, x3, y3);
    return this;
  }

  rCubicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) {
    this.ref.rCubicTo(x1, y1, x2, y2, x3, y3);
    return this;
  }

  close() {
    this.ref.close();
    return this;
  }

  // Arc methods
  arcToOval(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number,
    forceMoveTo: boolean
  ) {
    this.ref.arcToOval(
      JsiSkRect.fromValue(this.CanvasKit, oval),
      startAngleInDegrees,
      sweepAngleInDegrees,
      forceMoveTo
    );
    return this;
  }

  arcToRotated(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    x: number,
    y: number
  ) {
    this.ref.arcToRotated(
      rx,
      ry,
      xAxisRotateInDegrees,
      useSmallArc,
      isCCW,
      x,
      y
    );
    return this;
  }

  rArcTo(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    dx: number,
    dy: number
  ) {
    this.ref.rArcTo(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, dx, dy);
    return this;
  }

  arcToTangent(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.ref.arcToTangent(x1, y1, x2, y2, radius);
    return this;
  }

  // Shape methods
  addRect(rect: SkRect, isCCW?: boolean) {
    this.ref.addRect(JsiSkRect.fromValue(this.CanvasKit, rect), isCCW);
    return this;
  }

  addOval(oval: SkRect, isCCW?: boolean, startIndex?: number) {
    this.ref.addOval(
      JsiSkRect.fromValue(this.CanvasKit, oval),
      isCCW,
      startIndex
    );
    return this;
  }

  addArc(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number
  ) {
    this.ref.addArc(
      JsiSkRect.fromValue(this.CanvasKit, oval),
      startAngleInDegrees,
      sweepAngleInDegrees
    );
    return this;
  }

  addRRect(rrect: InputRRect, isCCW?: boolean) {
    this.ref.addRRect(JsiSkRRect.fromValue(this.CanvasKit, rrect), isCCW);
    return this;
  }

  addCircle(x: number, y: number, r: number, _isCCW?: boolean) {
    this.ref.addCircle(x, y, r);
    return this;
  }

  addPoly(points: SkPoint[], close: boolean) {
    this.ref.addPoly(
      points.map((p) => Array.from(JsiSkPoint.fromValue(p))).flat(),
      close
    );
    return this;
  }

  addPath(src: SkPath, matrix?: SkMatrix, extend = false) {
    const args = [
      JsiSkPath.fromValue(src),
      ...(matrix ? JsiSkMatrix.fromValue<Float32Array>(matrix) : []),
      extend,
    ];
    this.ref.addPath(...args);
    return this;
  }

  // Configuration methods
  setFillType(fill: FillType) {
    this.ref.setFillType(getEnum(this.CanvasKit, "FillType", fill));
    return this;
  }

  setIsVolatile(isVolatile: boolean) {
    this.ref.setIsVolatile(isVolatile);
    return this;
  }

  reset() {
    this.ref.reset();
    return this;
  }

  offset(dx: number, dy: number) {
    this.ref.offset(dx, dy);
    return this;
  }

  transform(m: InputMatrix) {
    let matrix =
      m instanceof JsiSkMatrix
        ? Array.from(JsiSkMatrix.fromValue<Matrix3x3>(m))
        : (m as Exclude<InputMatrix, SkMatrix>);
    if (matrix.length === 16) {
      matrix = [
        matrix[0],
        matrix[1],
        matrix[3],
        matrix[4],
        matrix[5],
        matrix[7],
        matrix[12],
        matrix[13],
        matrix[15],
      ];
    } else if (matrix.length !== 9) {
      throw new Error(`Invalid matrix length: ${matrix.length}`);
    }
    this.ref.transform(matrix);
    return this;
  }

  // Query methods
  computeBounds(): SkRect {
    return new JsiSkRect(this.CanvasKit, this.ref.getBounds());
  }

  isEmpty(): boolean {
    return this.ref.isEmpty();
  }

  getLastPt(): { x: number; y: number } {
    const count = this.ref.countPoints();
    if (count === 0) {
      return { x: 0, y: 0 };
    }
    const pt = this.ref.getPoint(count - 1);
    return { x: pt[0], y: pt[1] };
  }

  countPoints(): number {
    return this.ref.countPoints();
  }

  // Build methods
  build(): SkPath {
    // Return a copy of the current path
    return new JsiSkPath(this.CanvasKit, this.ref.copy());
  }

  detach(): SkPath {
    // Return the current path and reset the builder
    const path = new JsiSkPath(this.CanvasKit, this.ref.copy());
    this.ref.reset();
    return path;
  }
}
