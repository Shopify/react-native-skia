import type { IFont } from "./Font";

export enum PathOp {
  Difference, //!< subtract the op path from the first path
  Intersect, //!< intersect the two paths
  Union, //!< union (inclusive-or) the two paths
  XOR, //!< exclusive-or the two paths
  ReverseDifference,
}

export interface IPath {
  /** Adds beginning of contour at SkPoint (x, y).

        @param x  x-axis value of contour start
        @param y  y-axis value of contour start
        @return   reference to SkPath

        example: https://fiddle.skia.org/c/@Path_moveTo
    */
  moveTo: (x: number, y: number) => void;
  /** Adds line from last point to (x, y). If SkPath is empty, or last SkPath::Verb is
        kClose_Verb, last point is set to (0, 0) before adding line.

        lineTo() appends kMove_Verb to verb array and (0, 0) to SkPoint array, if needed.
        lineTo() then appends kLine_Verb to verb array and (x, y) to SkPoint array.

        @param x  end of added line on x-axis
        @param y  end of added line on y-axis
        @return   reference to SkPath

        example: https://fiddle.skia.org/c/@Path_lineTo
    */
  lineTo: (x: number, y: number) => void;
  /** Appends kClose_Verb to SkPath. A closed contour connects the first and last SkPoint
        with line, forming a continuous loop. Open and closed contour draw the same
        with SkPaint::kFill_Style. With SkPaint::kStroke_Style, open contour draws
        SkPaint::Cap at contour start and end; closed contour draws
        SkPaint::Join at contour start and end.

        close() has no effect if SkPath is empty or last SkPath SkPath::Verb is kClose_Verb.

        @return  reference to SkPath

        example: https://fiddle.skia.org/c/@Path_close
    */
  close: () => void;

  /***
   Appends arc to SkPath.

    Arc added is part of ellipse bounded by oval, from startAngle through sweepAngle.
    Both startAngle and sweepAngle are measured in degrees, where zero degrees is aligned with the positive x-axis, 
    and positive sweeps extends arc clockwise.

    arcTo() adds line connecting SkPath last SkPoint to initial arc SkPoint if forceMoveTo is false and SkPath
    is not empty. Otherwise, added contour begins with first point of arc. Angles greater than -360 and less than 360
    are treated modulo 360.

    Parameters
    oval	bounds of ellipse containing arc
    startAngle	starting angle of arc in degrees
    sweepAngle	sweep, in degrees. Positive is clockwise; treated modulo 360
    forceMoveTo	true to start a new contour with arc

    example: https://fiddle.skia.org/c/@Path_arcTo  
   */
  arcTo: (
    rx: number,
    ry: number,
    xAxisRotate: number,
    largeArc: boolean,
    sweep: boolean,
    x: number,
    y: number
  ) => void;

  /***
   * Adds cubic from last point towards (x1, y1), then towards (x2, y2), ending at (x3, y3).

    If SkPath is empty, or last SkPath::Verb is kClose_Verb, last point is set to (0, 0) before adding cubic.

    Appends kMove_Verb to verb array and (0, 0) to SkPoint array, if needed; then appends kCubic_Verb to verb array; 
    and (x1, y1), (x2, y2), (x3, y3) to SkPoint array.

    Parameters
    x1	first control SkPoint of cubic on x-axis
    y1	first control SkPoint of cubic on y-axis
    x2	second control SkPoint of cubic on x-axis
    y2	second control SkPoint of cubic on y-axis
    x3	end SkPoint of cubic on x-axis
    y3	end SkPoint of cubic on y-axis
   */
  cubicTo: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) => void;
  /**
   Adds quad from last point towards (x1, y1), to (x2, y2).

   If SkPath is empty, or last SkPath::Verb is kClose_Verb, last point is set to (0, 0) before adding quad.

   Appends kMove_Verb to verb array and (0, 0) to SkPoint array, if needed; then appends kQuad_Verb to verb array;
   and (x1, y1), (x2, y2) to SkPoint array.

   Parameters
   x1	control SkPoint of quad on x-axis
   y1	control SkPoint of quad on y-axis
   x2	end SkPoint of quad on x-axis
   y2	end SkPoint of quad on y-axis
   Returns
   reference to SkPath
   example: https://fiddle.skia.org/c/@Path_quadTo
  */
  quadTo: (x1: number, y1: number, x2: number, y2: number) => void;

  addRect: (x: number, y: number, width: number, height: number) => void;
  addRoundRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    ry: number
  ) => void;
  addCircle: (x: number, y: number, r: number) => void;

  getLastPt: () => { x: number; y: number };

  /** Set this path to the result of applying the Op to this path and the
    specified path: this = (this op operand).
    The resulting path will be constructed from non-overlapping contours.
    The curve order is reduced where possible so that cubics may be turned
    into quadratics, and quadratics maybe turned into lines.

    Returns true if operation was able to produce a result;
    otherwise, result is unmodified.

    @param path The second path (for difference, the subtrahend)
    @param op The operator to apply.
    @param result The product of the operands. The result may be one of the
                  inputs.
    @return True if the operation succeeded.
    */
  op: (path: IPath, op: PathOp) => boolean;

  /** Set this path to a set of non-overlapping contours that describe the
    same area as the original path.
    The curve order is reduced where possible so that cubics may
    be turned into quadratics, and quadratics maybe turned into lines.

    Returns true if operation was able to produce a result;
    otherwise, result is unmodified.

    @param result The simplified path. The result may be the input.
    @return True if simplification succeeded.
  */
  simplify: () => boolean;

  /**
   * Converts the text to a path with the given font at location x / y.
   */
  fromText: (text: string, x: number, y: number, font: IFont) => void;

  /**
   * Converts the svg path to a path
   */
  fromSvgPath: (path: string) => boolean;

  /**
   * Changes the underlying path to the other path parameter
   */
  fromPath: (path: IPath) => void;
}
