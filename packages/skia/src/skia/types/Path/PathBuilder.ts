import type { SkRect } from "../Rect";
import type { SkPoint } from "../Point";
import type { InputRRect } from "../RRect";
import type { InputMatrix, SkMatrix } from "../Matrix";
import type { SkJSIInstance } from "../JsiInstance";

import type { FillType, SkPath } from "./Path";

/**
 * SkPathBuilder is a mutable builder for constructing SkPath objects.
 * Once construction is complete, call build() or detach() to get the immutable SkPath.
 */
export interface SkPathBuilder extends SkJSIInstance<"PathBuilder"> {
  // Movement methods

  /**
   * Adds beginning of contour at point (x, y).
   * @param x - x-axis value of contour start
   * @param y - y-axis value of contour start
   * @returns reference to this PathBuilder for chaining
   */
  moveTo(x: number, y: number): SkPathBuilder;

  /**
   * Adds beginning of contour relative to the last point.
   * @param x - offset from last point on x-axis
   * @param y - offset from last point on y-axis
   * @returns reference to this PathBuilder for chaining
   */
  rMoveTo(x: number, y: number): SkPathBuilder;

  /**
   * Adds line from last point to (x, y).
   * @param x - end of line on x-axis
   * @param y - end of line on y-axis
   * @returns reference to this PathBuilder for chaining
   */
  lineTo(x: number, y: number): SkPathBuilder;

  /**
   * Adds line from last point, relative to last point.
   * @param x - offset from last point on x-axis
   * @param y - offset from last point on y-axis
   * @returns reference to this PathBuilder for chaining
   */
  rLineTo(x: number, y: number): SkPathBuilder;

  // Curve methods

  /**
   * Adds quad from last point towards (x1, y1), to (x2, y2).
   */
  quadTo(x1: number, y1: number, x2: number, y2: number): SkPathBuilder;

  /**
   * Relative version of quadTo.
   */
  rQuadTo(x1: number, y1: number, x2: number, y2: number): SkPathBuilder;

  /**
   * Adds conic from last point towards (x1, y1), to (x2, y2), weighted by w.
   */
  conicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w: number
  ): SkPathBuilder;

  /**
   * Relative version of conicTo.
   */
  rConicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w: number
  ): SkPathBuilder;

  /**
   * Adds cubic from last point towards (x1, y1), then towards (x2, y2), ending at (x3, y3).
   */
  cubicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): SkPathBuilder;

  /**
   * Relative version of cubicTo.
   */
  rCubicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): SkPathBuilder;

  /**
   * Appends CLOSE_VERB to the builder, connecting first and last points.
   */
  close(): SkPathBuilder;

  // Arc methods

  /**
   * Appends arc to the builder. Arc is part of ellipse bounded by oval.
   * @param oval - bounds of ellipse containing arc
   * @param startAngleInDegrees - starting angle of arc in degrees
   * @param sweepAngleInDegrees - sweep, in degrees. Positive is clockwise
   * @param forceMoveTo - true to start a new contour with arc
   */
  arcToOval(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number,
    forceMoveTo: boolean
  ): SkPathBuilder;

  /**
   * Appends arc to the builder with SVG-style parameters.
   * @param rx - x-radius of ellipse
   * @param ry - y-radius of ellipse
   * @param xAxisRotateInDegrees - rotation of ellipse
   * @param useSmallArc - if true, use smaller of two arcs
   * @param isCCW - if true, arc sweeps counter-clockwise
   * @param x - end point x
   * @param y - end point y
   */
  arcToRotated(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    x: number,
    y: number
  ): SkPathBuilder;

  /**
   * Relative version of arcToRotated.
   */
  rArcTo(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    dx: number,
    dy: number
  ): SkPathBuilder;

  /**
   * Appends arc to the builder, tangent to two lines.
   * @param x1 - x of first tangent point
   * @param y1 - y of first tangent point
   * @param x2 - x of second tangent point
   * @param y2 - y of second tangent point
   * @param radius - arc radius
   */
  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number
  ): SkPathBuilder;

  // Shape methods

  /**
   * Adds Rect to the builder.
   * @param rect - rectangle to add
   * @param isCCW - if true, draws counter-clockwise
   */
  addRect(rect: SkRect, isCCW?: boolean): SkPathBuilder;

  /**
   * Adds oval to the builder.
   * @param oval - bounds of ellipse
   * @param isCCW - if true, draws counter-clockwise
   * @param startIndex - index of initial point
   */
  addOval(oval: SkRect, isCCW?: boolean, startIndex?: number): SkPathBuilder;

  /**
   * Appends arc to the builder as a new contour.
   * @param oval - bounds of ellipse
   * @param startAngleInDegrees - starting angle
   * @param sweepAngleInDegrees - sweep angle
   */
  addArc(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number
  ): SkPathBuilder;

  /**
   * Adds rounded rectangle to the builder.
   * @param rrect - rounded rectangle to add
   * @param isCCW - if true, draws counter-clockwise
   */
  addRRect(rrect: InputRRect, isCCW?: boolean): SkPathBuilder;

  /**
   * Adds circle to the builder.
   * @param x - center x
   * @param y - center y
   * @param r - radius
   * @param isCCW - if true, draws counter-clockwise
   */
  addCircle(x: number, y: number, r: number, isCCW?: boolean): SkPathBuilder;

  /**
   * Adds polygon to the builder from array of points.
   * @param points - array of points
   * @param close - if true, close the polygon
   */
  addPoly(points: SkPoint[], close: boolean): SkPathBuilder;

  /**
   * Adds the path to the builder.
   * @param src - path to add
   * @param matrix - optional transform matrix
   * @param extend - if true, extend rather than append
   */
  addPath(src: SkPath, matrix?: SkMatrix, extend?: boolean): SkPathBuilder;

  // Configuration methods

  /**
   * Sets the fill type for the path.
   * @param fill - fill type to set
   */
  setFillType(fill: FillType): SkPathBuilder;

  /**
   * Sets whether the path is volatile (temporary/animating).
   * @param isVolatile - true if path will be altered frequently
   */
  setIsVolatile(isVolatile: boolean): SkPathBuilder;

  /**
   * Resets the builder to empty state.
   */
  reset(): SkPathBuilder;

  /**
   * Translates all points in the builder.
   * @param dx - translation in x
   * @param dy - translation in y
   */
  offset(dx: number, dy: number): SkPathBuilder;

  /**
   * Transforms all points in the builder by the matrix.
   * @param m - transformation matrix
   */
  transform(m: InputMatrix): SkPathBuilder;

  // Query methods

  /**
   * Returns the bounds of the path being built.
   */
  computeBounds(): SkRect;

  /**
   * Returns true if the builder has no verbs.
   */
  isEmpty(): boolean;

  /**
   * Returns the last point added to the builder.
   */
  getLastPt(): { x: number; y: number };

  /**
   * Returns the number of points in the builder.
   */
  countPoints(): number;

  // Build methods

  /**
   * Returns a new SkPath with the current builder state.
   * The builder is NOT reset and can continue to be used.
   */
  build(): SkPath;

  /**
   * Returns a new SkPath with the current builder state and resets the builder.
   * More efficient than build() when you're done with this builder.
   */
  detach(): SkPath;
}
