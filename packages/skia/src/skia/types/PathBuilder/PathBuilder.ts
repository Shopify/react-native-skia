import type { SkRect } from "../Rect";
import type { SkPoint } from "../Point";
import type { InputRRect } from "../RRect";
import type { FillType, SkPath } from "../Path/Path";
import type { SkJSIInstance } from "../JsiInstance";

/**
 * An SkPathBuilder provides an explicit builder API for constructing paths
 * incrementally. Call snapshot() to get an immutable copy, or build() to
 * detach and reset the builder.
 */
export interface SkPathBuilder extends SkJSIInstance<"PathBuilder"> {
  // Contour verbs
  moveTo(x: number, y: number): SkPathBuilder;
  lineTo(x: number, y: number): SkPathBuilder;
  quadTo(x1: number, y1: number, x2: number, y2: number): SkPathBuilder;
  conicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w: number
  ): SkPathBuilder;
  cubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number
  ): SkPathBuilder;
  close(): SkPathBuilder;

  // Relative contour verbs
  rMoveTo(dx: number, dy: number): SkPathBuilder;
  rLineTo(dx: number, dy: number): SkPathBuilder;
  rQuadTo(dx1: number, dy1: number, dx2: number, dy2: number): SkPathBuilder;
  rConicTo(
    dx1: number,
    dy1: number,
    dx2: number,
    dy2: number,
    w: number
  ): SkPathBuilder;
  rCubicTo(
    dx1: number,
    dy1: number,
    dx2: number,
    dy2: number,
    dx3: number,
    dy3: number
  ): SkPathBuilder;

  // Arc variants
  arcToOval(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number,
    forceMoveTo: boolean
  ): SkPathBuilder;
  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number
  ): SkPathBuilder;
  arcToRotated(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    x: number,
    y: number
  ): SkPathBuilder;
  rArcTo(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    dx: number,
    dy: number
  ): SkPathBuilder;

  // Contour shapes
  addArc(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number
  ): SkPathBuilder;
  addRect(rect: SkRect, isCCW?: boolean): SkPathBuilder;
  addOval(oval: SkRect, isCCW?: boolean, startIndex?: number): SkPathBuilder;
  addRRect(rrect: InputRRect, isCCW?: boolean): SkPathBuilder;
  addCircle(x: number, y: number, r: number, isCCW?: boolean): SkPathBuilder;
  addPolygon(points: SkPoint[], close: boolean): SkPathBuilder;
  addPath(src: SkPath, extend?: boolean): SkPathBuilder;

  // State mutation
  reset(): SkPathBuilder;
  setFillType(fill: FillType): SkPathBuilder;
  setIsVolatile(volatile: boolean): SkPathBuilder;
  setLastPoint(x: number, y: number): SkPathBuilder;
  setPoint(index: number, x: number, y: number): SkPathBuilder;

  // Query
  computeBounds(): SkRect;
  computeTightBounds(): SkRect;
  isEmpty(): boolean;
  countPoints(): number;
  countVerbs(): number;

  /**
   * Returns an immutable SkPath snapshot of the current builder state.
   * The builder is left unchanged.
   */
  snapshot(): SkPath;

  /**
   * Returns an immutable SkPath and resets the builder to empty.
   */
  build(): SkPath;
}
