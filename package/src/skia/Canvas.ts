import type { ProcessedColorValue } from "react-native";

import type { IPaint } from "./Paint";
import type { IRect } from "./Rect";
import type { IFont } from "./Font";
import type { IPath } from "./Path";
import type { IImage } from "./Image";
import type { ISvgDom } from "./Svg";

export type Canvas = {
  /** Draws the image at the given (x, y) position.

        @param image Image to draw
        @param x x location
        @param y y location
        @param paint  graphics state used to fill SkCanvas      
    */
  drawImage: (image: IImage, x: number, y: number, paint?: IPaint) => void;

  /** Draws the image in the given rectangle.

        @param image Image to draw
        @param rect rect to draw in
        @param paint  graphics state used to fill SkCanvas      
    */
  drawImageRect: (image: IImage, rect: IRect, paint?: IPaint) => void;

  /** Fills clip with SkPaint paint. SkPaint components, SkShader,
        SkColorFilter, SkImageFilter, and SkBlendMode affect drawing;
        SkMaskFilter and SkPathEffect in paint are ignored.

        @param paint  graphics state used to fill SkCanvas

        example: https://fiddle.skia.org/c/@Canvas_drawPaint
    */
  drawPaint: (paint: IPaint) => void;
  /** Draws point at (x, y) using clip, SkMatrix and SkPaint paint.

        The shape of point drawn depends on paint SkPaint::Cap.
        If paint is set to SkPaint::kRound_Cap, draw a circle of diameter
        SkPaint stroke width. If paint is set to SkPaint::kSquare_Cap or SkPaint::kButt_Cap,
        draw a square of width and height SkPaint stroke width.
        SkPaint::Style is ignored, as if were set to SkPaint::kStroke_Style.

        @param x      left edge of circle or square
        @param y      top edge of circle or square
        @param paint  stroke, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawPoint
    */
  drawPoint: (x: number, y: number, paint: IPaint) => void;
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
    paint: IPaint
  ) => void;
  /** Draws SkRect rect using clip, SkMatrix, and SkPaint paint.
        In paint: SkPaint::Style determines if rectangle is stroked or filled;
        if stroked, SkPaint stroke width describes the line thickness, and
        SkPaint::Join draws the corners rounded or square.

        @param rect   rectangle to draw
        @param paint  stroke or fill, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawRect
    */
  drawRect: (rect: IRect, paint: IPaint) => void;
  /** Draws circle at (cx, cy) with radius using clip, SkMatrix, and SkPaint paint.
        If radius is zero or less, nothing is drawn.
        In paint: SkPaint::Style determines if circle is stroked or filled;
        if stroked, SkPaint stroke width describes the line thickness.

        @param cx      circle center on the x-axis
        @param cy      circle center on the y-axis
        @param radius  half the diameter of circle
        @param paint   SkPaint stroke or fill, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawCircle
    */
  drawCircle: (cx: number, cy: number, radius: number, paint: IPaint) => void;
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
    oval: IRect,
    startAngle: number,
    sweepAngle: number,
    useCenter: boolean,
    paint: IPaint
  ) => void;
  /** Draws SkRRect bounded by SkRect rect, with corner radii (rx, ry) using clip,
        SkMatrix, and SkPaint paint.

        In paint: SkPaint::Style determines if SkRRect is stroked or filled;
        if stroked, SkPaint stroke width describes the line thickness.
        If rx or ry are less than zero, they are treated as if they are zero.
        If rx plus ry exceeds rect width or rect height, radii are scaled down to fit.
        If rx and ry are zero, SkRRect is drawn as SkRect and if stroked is affected by
        SkPaint::Join.

        @param rect   SkRect bounds of SkRRect to draw
        @param rx     axis length on x-axis of oval describing rounded corners
        @param ry     axis length on y-axis of oval describing rounded corners
        @param paint  stroke, blend, color, and so on, used to draw

        example: https://fiddle.skia.org/c/@Canvas_drawRoundRect
    */
  drawRoundRect: (rect: IRect, rx: number, ry: number, paint: IPaint) => void;
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
  drawPath: (path: IPath, paint: IPaint) => void;
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
    font: IFont,
    paint: IPaint
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
  /** Saves SkMatrix and clip, and allocates a SkBitmap for subsequent drawing.
        Calling restore() discards changes to SkMatrix and clip, and draws the SkBitmap.

        SkMatrix may be changed by translate(), scale(), rotate(), skew(), concat(),
        setMatrix(), and resetMatrix(). Clip may be changed by clipRect(), clipRRect(),
        clipPath(), clipRegion().

        SkRect bounds suggests but does not define the layer size. To clip drawing to
        a specific rectangle, use clipRect().

        Optional SkPaint paint applies alpha, SkColorFilter, SkImageFilter, and
        SkBlendMode when restore() is called.

        Call restoreToCount() with returned value to restore this and subsequent saves.

        @param bounds  hint to limit the size of layer; may be nullptr
        @param paint   graphics state for layer; may be nullptr
        @return        depth of saved stack
    */
  saveLayer: (bounds: IRect, paint: IPaint) => number;
  /** Removes changes to SkMatrix and clip since SkCanvas state was
        last saved. The state is removed from the stack.

        Does nothing if the stack is empty.

        example: https://fiddle.skia.org/c/@AutoCanvasRestore_restore

        example: https://fiddle.skia.org/c/@Canvas_restore
    */
  restore: () => void;
  /** Rotates SkMatrix by degrees. Positive degrees rotates clockwise.

        Mathematically, replaces SkMatrix with a rotation matrix
        premultiplied with SkMatrix.

        This has the effect of rotating the drawing by degrees before transforming
        the result with SkMatrix.

        @param degrees  amount to rotate, in degrees

        example: https://fiddle.skia.org/c/@Canvas_rotate
    */
  rotate: (degrees: number) => void;
  /** Translates SkMatrix by dx along the x-axis and dy along the y-axis.

        Mathematically, replaces SkMatrix with a translation matrix
        premultiplied with SkMatrix.

        This has the effect of moving the drawing by (dx, dy) before transforming
        the result with SkMatrix.

        @param dx  distance to translate on x-axis
        @param dy  distance to translate on y-axis

        example: https://fiddle.skia.org/c/@Canvas_translate
    */
  translate: (dx: number, dy: number) => void;
  /** Scales SkMatrix by sx on the x-axis and sy on the y-axis.

        Mathematically, replaces SkMatrix with a scale matrix
        premultiplied with SkMatrix.

        This has the effect of scaling the drawing by (sx, sy) before transforming
        the result with SkMatrix.

        @param sx  amount to scale on x-axis
        @param sy  amount to scale on y-axis

        example: https://fiddle.skia.org/c/@Canvas_scale
    */
  scale: (sx: number, sy: number) => void;
  /**
   Skews SkMatrix by sx on the x-axis and sy on the y-axis.

    A positive value of sx skews the drawing right as y-axis values increase; a positive value of sy skews the drawing
    down as x-axis values increase.

    Mathematically, replaces SkMatrix with a skew matrix premultiplied with SkMatrix.

    This has the effect of skewing the drawing by (sx, sy) before transforming the result with SkMatrix.

    Parameters
    sx	amount to skew on x-axis
    sy	amount to skew on y-axis
    example: https://fiddle.skia.org/c/@Canvas_skew
   */
  skew: (sx: number, sy: number) => void;
  /** Fills clip with color color.
        mode determines how ARGB is combined with destination.

        @param color  unpremultiplied ARGB
        @param mode   TODO: SkBlendMode used to combine source color and destination

        example: https://fiddle.skia.org/c/@Canvas_drawColor
    */
  drawColor: (color: ProcessedColorValue | null | undefined) => void;
  /**
    Replaces clip with the intersection of clip and path.
    Resulting clip is aliased; pixels are fully contained by the clip. SkPath::FillType determines if path describes
    the area inside or outside its contours; and if path contour overlaps itself or another path contour,
    whether the overlaps form part of the area. path is transformed by SkMatrix before it is combined with clip.

    @param path	SkPath to combine with clip
    @papram doAntiAlias	true if clip is to be anti-aliased
   */
  clipPath: (path: IPath, doAntiAlias: boolean) => void;
};
