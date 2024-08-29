import type { SkJSIInstance } from "./JsiInstance";
import type { SkPath } from "./Path/Path";
import type { SkPoint } from "./Point";

export interface PosTan {
  px: number;
  py: number;
  tx: number;
  ty: number;
}

export interface SkContourMeasure extends SkJSIInstance<"ContourMeasure"> {
  /**
   * Returns the given position and tangent line for the distance on the given contour.
   * The return value an array of 2 vectors: [position, tangent]
   * @param distance - will be pinned between 0 and length().
   */
  getPosTan(distance: number): [position: SkPoint, tangent: SkPoint];

  /**
   * Returns an Path representing the segment of this contour.
   * @param startD - will be pinned between 0 and length()
   * @param stopD - will be pinned between 0 and length()
   * @param startWithMoveTo
   */
  getSegment(startD: number, stopD: number, startWithMoveTo: boolean): SkPath;

  /**
   * Returns true if the contour is closed.
   */
  isClosed(): boolean;

  /**
   * Returns the length of this contour.
   */
  length(): number;
}

export interface SkContourMeasureIter
  extends SkJSIInstance<"ContourMeasureIter"> {
  /**
   *  Iterates through contours in path, returning a contour-measure object for each contour
   *  in the path. Returns null when it is done.
   *
   *  See SkContourMeasure.h for more details.
   */
  next(): SkContourMeasure | null;
}
