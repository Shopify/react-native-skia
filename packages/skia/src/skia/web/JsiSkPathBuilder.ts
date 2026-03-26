import type { CanvasKit, Path } from "canvaskit-wasm";

import type {
  FillType,
  SkPath,
  SkPoint,
  SkRect,
  InputRRect,
} from "../types";
import type { SkPathBuilder } from "../types/PathBuilder";

import { getEnum, HostObject } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkRRect } from "./JsiSkRRect";

/**
 * Web implementation of SkPathBuilder backed by a mutable CanvasKit Path.
 * CanvasKit's Path is already mutable, so we use it directly as the builder
 * and copy() for snapshot semantics.
 */
export class JsiSkPathBuilder
  extends HostObject<Path, "PathBuilder">
  implements SkPathBuilder
{
  constructor(CanvasKit: CanvasKit, ref: Path) {
    super(CanvasKit, ref, "PathBuilder");
  }

  // Contour verbs
  moveTo(x: number, y: number) {
    this.ref.moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number) {
    this.ref.lineTo(x, y);
    return this;
  }

  quadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.quadTo(x1, y1, x2, y2);
    return this;
  }

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.conicTo(x1, y1, x2, y2, w);
    return this;
  }

  cubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number
  ) {
    this.ref.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);
    return this;
  }

  close() {
    this.ref.close();
    return this;
  }

  // Relative contour verbs
  rMoveTo(dx: number, dy: number) {
    this.ref.rMoveTo(dx, dy);
    return this;
  }

  rLineTo(dx: number, dy: number) {
    this.ref.rLineTo(dx, dy);
    return this;
  }

  rQuadTo(dx1: number, dy1: number, dx2: number, dy2: number) {
    this.ref.rQuadTo(dx1, dy1, dx2, dy2);
    return this;
  }

  rConicTo(dx1: number, dy1: number, dx2: number, dy2: number, w: number) {
    this.ref.rConicTo(dx1, dy1, dx2, dy2, w);
    return this;
  }

  rCubicTo(
    dx1: number,
    dy1: number,
    dx2: number,
    dy2: number,
    dx3: number,
    dy3: number
  ) {
    this.ref.rCubicTo(dx1, dy1, dx2, dy2, dx3, dy3);
    return this;
  }

  // Arc variants
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

  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number
  ) {
    this.ref.arcToTangent(x1, y1, x2, y2, radius);
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
    this.ref.arcToRotated(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, x, y);
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

  // Contour shapes
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

  addRRect(rrect: InputRRect, isCCW?: boolean) {
    this.ref.addRRect(JsiSkRRect.fromValue(this.CanvasKit, rrect), isCCW);
    return this;
  }

  addCircle(x: number, y: number, r: number, _isCCW?: boolean) {
    this.ref.addCircle(x, y, r);
    return this;
  }

  addPolygon(points: SkPoint[], close: boolean) {
    this.ref.addPoly(
      points.map((p) => Array.from(JsiSkPoint.fromValue(p))).flat(),
      close
    );
    return this;
  }

  addPath(src: SkPath, extend?: boolean) {
    this.ref.addPath(JsiSkPath.fromValue(src), extend);
    return this;
  }

  // State mutation
  reset() {
    this.ref.reset();
    return this;
  }

  setFillType(fill: FillType) {
    this.ref.setFillType(getEnum(this.CanvasKit, "FillType", fill));
    return this;
  }

  setIsVolatile(v: boolean) {
    this.ref.setIsVolatile(v);
    return this;
  }

  setLastPoint(x: number, y: number) {
    console.warn("setLastPoint is not supported on React Native Web");
    void x;
    void y;
    return this;
  }

  setPoint(_index: number, _x: number, _y: number) {
    console.warn("setPoint is not supported on React Native Web");
    return this;
  }

  // Query
  computeBounds(): SkRect {
    return new JsiSkRect(this.CanvasKit, this.ref.getBounds());
  }

  computeTightBounds(): SkRect {
    return new JsiSkRect(this.CanvasKit, this.ref.computeTightBounds());
  }

  isEmpty() {
    return this.ref.isEmpty();
  }

  countPoints() {
    return this.ref.countPoints();
  }

  countVerbs() {
    return this.ref.toCmds().length;
  }

  /**
   * Returns an immutable SkPath snapshot. The builder is left unchanged.
   */
  snapshot(): SkPath {
    return new JsiSkPath(this.CanvasKit, this.ref.copy());
  }

  /**
   * Returns an immutable SkPath and resets the builder to empty.
   */
  build(): SkPath {
    const path = this.ref.copy();
    this.ref.reset();
    return new JsiSkPath(this.CanvasKit, path);
  }
}
