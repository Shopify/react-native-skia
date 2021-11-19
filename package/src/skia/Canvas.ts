import type { Paint } from "./Paint";
import type { Rect } from "./Rect";
import type { Font } from "./Font";
import type { Path } from "./Path";
import type { Image } from "./Image";
import type { ISvgDom } from "./Svg";
import type { Color } from "./Color";
import type { RRect } from "./RRect";
import type { BlendMode } from "./Paint/BlendMode";
import type { Point, PointMode } from "./Point";
import type { Matrix } from "./Matrix";
import type { ImageFilter } from "./ImageFilter";

export interface Info {
  width: number;
  height: number;
}

export enum ClipOp {
  Difference,
  Intersect,
}

export type Canvas = {
  /** Draws the image at the given (x, y) position.

        @param image Image to draw
        @param x x location
        @param y y location
        @param paint  graphics state used to fill SkCanvas      
    */
  drawImage: (image: Image, x: number, y: number, paint?: Paint) => void;

  /** Draws the image in the given rectangle.

        @param image Image to draw
        @param rect rect to draw in
        @param paint  graphics state used to fill SkCanvas      
    */
  drawImageRect: (image: Image, rect: Rect, paint?: Paint) => void;

  /** Fills clip with SkPaint paint. SkPaint components, SkShader,
        SkColorFilter, SkImageFilter, and SkBlendMode affect drawing;
        SkMaskFilter and SkPathEffect in paint are ignored.

        @param paint  graphics state used to fill SkCanvas

        example: https://fiddle.skia.org/c/@Canvas_drawPaint
    */
  drawPaint: (paint: Paint) => void;

  /** Draws line segment from (x0, y0) to (x1, y1) using clip, SkMatrix, and SkPaint paint.
        In paint: SkPaint stroke width describes the line thickness;
        SkPaint::Cap draws the end rounded or square;
        SkPaint::Style is ignored, as if were set to SkPaint::kStroke_Style.

        @param x0     start of line segment on x-axis
        @param y0     start of line segment on y-axis
        @param x1     end of line segment on x-axis
        @param y1     end of line segment on y-axis
        @param paint  stroke, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawLine
    */
  drawLine: (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    paint: Paint
  ) => void;
  /** Draws SkRect rect using clip, SkMatrix, and SkPaint paint.
        In paint: SkPaint::Style determines if rectangle is stroked or filled;
        if stroked, SkPaint stroke width describes the line thickness, and
        SkPaint::Join draws the corners rounded or square.

        @param rect   rectangle to draw
        @param paint  stroke or fill, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawRect
    */
  drawRect: (rect: Rect, paint: Paint) => void;

  /**
   * Draws a circle at (cx, cy) with the given radius.
   * @param cx
   * @param cy
   * @param radius
   * @param paint
   */
  drawCircle(cx: number, cy: number, radius: number, paint: Paint): void;

  /**
   * Draws a cubic patch defined by 12 control points [top, right, bottom, left] with optional
   * colors and shader-coordinates [4] specifed for each corner [top-left, top-right, bottom-right, bottom-left]
   * @param cubics 12 points : 4 connected cubics specifying the boundary of the patch
   * @param colors optional colors interpolated across the patch
   * @param texs optional shader coordinates interpolated across the patch
   * @param mode Specifies how shader and colors blend (if both are specified)
   * @param paint
   */
  drawPatch(
    cubics: Point[],
    colors?: Color[] | null,
    texs?: Point[] | null,
    mode?: BlendMode | null,
    paint?: Paint
  ): void;

  /**
   * Restores state to a previous stack value.
   * @param saveCount
   */
  restoreToCount(saveCount: number): void;

  /**
   * Draws the given points using the current clip, current matrix, and the provided paint.
   *
   * See Canvas.h for more on the mode and its interaction with paint.
   * @param mode
   * @param points
   * @param paint
   */
  drawPoints(mode: PointMode, points: Point[], paint: Paint): void;

  /** Draws arc using clip, SkMatrix, and SkPaint paint.

        Arc is part of oval bounded by oval, sweeping from startAngle to startAngle plus
        sweepAngle. startAngle and sweepAngle are in degrees.

        startAngle of zero places start point at the right middle edge of oval.
        A positive sweepAngle places arc end point clockwise from start point;
        a negative sweepAngle places arc end point counterclockwise from start point.
        sweepAngle may exceed 360 degrees, a full circle.
        If useCenter is true, draw a wedge that includes lines from oval
        center to arc end points. If useCenter is false, draw arc between end points.

        If SkRect oval is empty or sweepAngle is zero, nothing is drawn.

        @param oval        SkRect bounds of oval containing arc to draw
        @param startAngle  angle in degrees where arc begins
        @param sweepAngle  sweep angle in degrees; positive is clockwise
        @param useCenter   if true, include the center of the oval
        @param paint       SkPaint stroke or fill, blend, color, and so on, used to draw
    */
  drawArc: (
    oval: Rect,
    startAngle: number,
    sweepAngle: number,
    useCenter: boolean,
    paint: Paint
  ) => void;

  /**
   * Draws the given rectangle with rounded corners using the current clip, current matrix,
   * and the provided paint.
   * @param rrect
   * @param paint
   */
  drawRRect(rrect: RRect, paint: Paint): void;

  /**
   * Draws RRect outer and inner using clip, Matrix, and Paint paint.
   * outer must contain inner or the drawing is undefined.
   * @param outer
   * @param inner
   * @param paint
   */
  drawDRRect(outer: RRect, inner: RRect, paint: Paint): void;

  /**
   * Draws an oval bounded by the given rectangle using the current clip, current matrix,
   * and the provided paint.
   * @param oval
   * @param paint
   */
  drawOval(oval: Rect, paint: Paint): void;

  /** Draws SkPath path using clip, SkMatrix, and SkPaint paint.
        SkPath contains an array of path contour, each of which may be open or closed.

        In paint: SkPaint::Style determines if SkRRect is stroked or filled:
        if filled, SkPath::FillType determines whether path contour describes inside or
        outside of fill; if stroked, SkPaint stroke width describes the line thickness,
        SkPaint::Cap describes line ends, and SkPaint::Join describes how
        corners are drawn.

        @param path   SkPath to draw
        @param paint  stroke, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawPath
    */
  drawPath: (path: Path, paint: Paint) => void;
  /** Draws text, with origin at (x, y), using clip, SkMatrix, SkFont font,
        and SkPaint paint.

        Text size is affected by SkMatrix and SkFont text size. Default text
        size is 12 point.

        All elements of paint: SkPathEffect, SkMaskFilter, SkShader,
        SkColorFilter, and SkImageFilter; apply to text. By
        default, draws filled black glyphs.

        @param text        character code points or glyphs drawn
        @param x           start of text on x-axis
        @param y           start of text on y-axis
        @param font        SkFont used to draw text
        @param paint       blend, color, and so on, used to draw
    */
  drawText: (
    text: string,
    x: number,
    y: number,
    font: Font,
    paint: Paint
  ) => void;
  /**
   * Renders the SVG Dom object to the canvas. If width/height are omitted,
   * the SVG will be rendered to fit the canvas.
   */
  drawSvg: (svgDom: ISvgDom, width?: number, height?: number) => void;
  /** Saves SkMatrix and clip.
        Calling restore() discards changes to SkMatrix and clip,
        restoring the SkMatrix and clip to their state when save() was called.

        SkMatrix may be changed by translate(), scale(), rotate(), skew(), concat(), setMatrix(),
        and resetMatrix(). Clip may be changed by clipRect(), clipRRect(), clipPath(), clipRegion().

        Saved SkCanvas state is put on a stack; multiple calls to save() should be balance
        by an equal number of calls to restore().

        Call restoreToCount() with result to restore this and subsequent saves.

        @return  depth of saved stack

        example: https://fiddle.skia.org/c/@Canvas_save
    */
  save: () => number;

  /**
   * Saves Matrix and clip, and allocates a SkBitmap for subsequent drawing.
   * Calling restore() discards changes to Matrix and clip, and draws the SkBitmap.
   * It returns the height of the stack.
   * See Canvas.h for more.
   * @param paint
   * @param bounds
   * @param backdrop
   * @param flags
   */
  saveLayer(
    paint?: Paint,
    bounds?: Rect | null,
    backdrop?: ImageFilter | null,
    flags?: number
  ): number;

  /**
   * Saves Matrix and clip, and allocates a SkBitmap for subsequent drawing.
   * Calling restore() discards changes to Matrix and clip, and draws the SkBitmap.
   * It returns the height of the stack.
   * See Canvas.h for more.
   * @param paint
   */
  saveLayerPaint(paint?: Paint): number;

  /** Removes changes to SkMatrix and clip since SkCanvas state was
        last saved. The state is removed from the stack.

        Does nothing if the stack is empty.

        example: https://fiddle.skia.org/c/@AutoCanvasRestore_restore

        example: https://fiddle.skia.org/c/@Canvas_restore
    */
  restore: () => void;

  /**
   * Rotates the current matrix by the number of degrees.
   * @param rot - angle of rotation in degrees.
   * @param rx
   * @param ry
   */
  rotate(rotationInDegrees: number, rx: number, ry: number): void;

  /**
   * Scales the current matrix by sx on the x-axis and sy on the y-axis.
   * @param sx
   * @param sy
   */
  scale(sx: number, sy: number): void;

  /**
   *  Skews Matrix by sx on the x-axis and sy on the y-axis. A positive value of sx
   *  skews the drawing right as y-axis values increase; a positive value of sy skews
   *  the drawing down as x-axis values increase.
   * @param sx
   * @param sy
   */
  skew(sx: number, sy: number): void;

  /**
   * Translates Matrix by dx along the x-axis and dy along the y-axis.
   * @param dx
   * @param dy
   */
  translate(dx: number, dy: number): void;

  /**
   * Fills clip with the given color.
   * @param color
   * @param blendMode - defaults to SrcOver.
   */
  drawColor(color: Color, blendMode?: BlendMode): void;

  /**
   * Fills the current clip with the given color using Src BlendMode.
   * This has the effect of replacing all pixels contained by clip with color.
   * @param color
   */
  clear(color: Color): void;

  /**
   * Replaces clip with the intersection or difference of the current clip and path,
   * with an aliased or anti-aliased clip edge.
   * @param path
   * @param op
   * @param doAntiAlias
   */
  clipPath(path: Path, op: ClipOp, doAntiAlias: boolean): void;

  /**
   * Replaces clip with the intersection or difference of the current clip and rect,
   * with an aliased or anti-aliased clip edge.
   * @param rect
   * @param op
   * @param doAntiAlias
   */
  clipRect(rect: Rect, op: ClipOp, doAntiAlias: boolean): void;

  /**
   * Replaces clip with the intersection or difference of the current clip and rrect,
   * with an aliased or anti-aliased clip edge.
   * @param rrect
   * @param op
   * @param doAntiAlias
   */
  clipRRect(rrect: RRect, op: ClipOp, doAntiAlias: boolean): void;

  /**
   * Replaces current matrix with m premultiplied with the existing matrix.
   * @param m
   */
  concat(m: Matrix): void;
};
