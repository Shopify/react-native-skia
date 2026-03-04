import type { SkRect } from "../Rect";
import type { SkPoint } from "../Point";
import type { StrokeJoin, StrokeCap } from "../Paint";
import type { InputMatrix } from "../Matrix";
import type { SkJSIInstance } from "../JsiInstance";

/**
 * Options used for Skia.Path.Stroke(). If an option is omitted, a sensible default will be used.
 */
export interface StrokeOpts {
  /** The width of the stroked lines. */
  width?: number;
  miter_limit?: number;
  /**
   * if > 1, increase precision, else if (0 < resScale < 1) reduce precision to
   * favor speed and size
   */
  precision?: number;
  join?: StrokeJoin;
  cap?: StrokeCap;
}

export enum FillType {
  Winding,
  EvenOdd,
  InverseWinding,
  InverseEvenOdd,
}

export enum PathOp {
  Difference, //!< subtract the op path from the first path
  Intersect, //!< intersect the two paths
  Union, //!< union (inclusive-or) the two paths
  XOR, //!< exclusive-or the two paths
  ReverseDifference,
}

export enum PathVerb {
  Move,
  Line,
  Quad,
  Conic,
  Cubic,
  Close,
}

export type PathCommand = number[];

export const isPath = (obj: SkJSIInstance<string> | null): obj is SkPath => {
  "worklet";
  return obj !== null && obj.__typename__ === "Path";
};

/**
 * SkPath is an immutable representation of a path.
 * Use SkPathBuilder to construct paths, or use the static factory methods on PathFactory.
 */
export interface SkPath extends SkJSIInstance<"Path"> {
  // Query methods - read-only access to path data

  /**
   * Returns the number of points in this path.
   */
  countPoints(): number;

  /**
   * Returns minimum and maximum axes values of the lines and curves in Path.
   * Returns (0, 0, 0, 0) if Path contains no points.
   * Returned bounds width and height may be larger or smaller than area affected
   * when Path is drawn.
   *
   * Behaves identically to getBounds() when Path contains
   * only lines. If Path contains curves, computed bounds includes
   * the maximum extent of the quad, conic, or cubic; is slower than getBounds();
   * and unlike getBounds(), does not cache the result.
   */
  computeTightBounds(): SkRect;

  /**
   * Returns true if the point (x, y) is contained by Path, taking into
   * account FillType.
   * @param x
   * @param y
   */
  contains(x: number, y: number): boolean;

  /**
   * Returns a copy of this Path.
   */
  copy(): SkPath;

  /**
   * Returns true if other path is equal to this path.
   * @param other
   */
  equals(other: SkPath): boolean;

  /**
   * Returns minimum and maximum axes values of Point array.
   * Returns (0, 0, 0, 0) if Path contains no points. Returned bounds width and height may
   * be larger or smaller than area affected when Path is drawn.
   */
  getBounds(): SkRect;

  /**
   * Return the FillType for this path.
   */
  getFillType(): FillType;

  /**
   * Returns the Point at index in Point array. Valid range for index is
   * 0 to countPoints() - 1.
   * @param index
   */
  getPoint(index: number): SkPoint;

  /**
   * Returns true if there are no verbs in the path.
   */
  isEmpty(): boolean;

  /**
   * Returns true if the path is volatile; it will not be altered or discarded
   * by the caller after it is drawn. Path by default have volatile set false, allowing
   * Surface to attach a cache of data which speeds repeated drawing. If true, Surface
   * may not speed repeated drawing.
   */
  isVolatile(): boolean;

  /**
   * Returns the last point added to the path.
   */
  getLastPt(): { x: number; y: number };

  /**
   * Returns this path as an SVG string.
   */
  toSVGString(): string;

  /**
   * Serializes the contents of this path as a series of commands.
   */
  toCmds(): PathCommand[];

  /** Returns true if Path contain equal verbs and equal weights.
   *     @param compare  path to compare
   *     @return         true if Path can be interpolated equivalent
   */
  isInterpolatable(compare: SkPath): boolean;

  /**
   * Interpolates between this path and the end path.
   * Returns a NEW path that is a weighted average of this path and the ending path.
   *
   * @param end - path to interpolate with
   * @param weight - contribution of this path (0 = end path, 1 = this path)
   * @return interpolated path or null if paths are not interpolatable
   */
  interpolate(end: SkPath, weight: number): SkPath | null;

  // Methods that return new paths (immutable transformations)

  /**
   * Returns a NEW path with all points translated by dx, dy.
   * The original path is unchanged.
   * @param dx
   * @param dy
   */
  offset(dx: number, dy: number): SkPath;

  /**
   * Returns a NEW path transformed by the specified matrix.
   * The original path is unchanged.
   * @param m3 - transformation matrix
   */
  transform(m3: InputMatrix): SkPath;
}
