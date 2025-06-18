import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkRect } from "./JsiSkRect";
import { Color } from "./JsiSkColor";
import { JsiSkSurfaceFactory } from "./JsiSkSurfaceFactory";
import { JsiSkRRect } from "./JsiSkRRect";
import { JsiSkRSXform } from "./JsiSkRSXform";
import { JsiSkContourMeasureIter } from "./JsiSkContourMeasureIter";
import { JsiSkPictureRecorder } from "./JsiSkPictureRecorder";
import { JsiSkPictureFactory } from "./JsiSkPictureFactory";
import { JsiSkPathFactory } from "./JsiSkPathFactory";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkColorFilterFactory } from "./JsiSkColorFilterFactory";
import { JsiSkTypefaceFactory } from "./JsiSkTypefaceFactory";
import { JsiSkMaskFilterFactory } from "./JsiSkMaskFilterFactory";
import { JsiSkRuntimeEffectFactory } from "./JsiSkRuntimeEffectFactory";
import { JsiSkImageFilterFactory } from "./JsiSkImageFilterFactory";
import { JsiSkShaderFactory } from "./JsiSkShaderFactory";
import { JsiSkPathEffectFactory } from "./JsiSkPathEffectFactory";
import { JsiSkDataFactory } from "./JsiSkDataFactory";
import { JsiSkImageFactory } from "./JsiSkImageFactory";
import { JsiSkSVGFactory } from "./JsiSkSVGFactory";
import { JsiSkTextBlobFactory } from "./JsiSkTextBlobFactory";
import { JsiSkFont } from "./JsiSkFont";
import { MakeVertices } from "./JsiSkVerticesFactory";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkTypeface } from "./JsiSkTypeface";
import { JsiSkTypefaceFontProviderFactory } from "./JsiSkTypefaceFontProviderFactory";
import { JsiSkFontMgrFactory } from "./JsiSkFontMgrFactory";
import { JsiSkAnimatedImageFactory } from "./JsiSkAnimatedImageFactory";
import { JsiSkParagraphBuilderFactory } from "./JsiSkParagraphBuilderFactory";
import { JsiSkNativeBufferFactory } from "./JsiSkNativeBufferFactory";
import { createVideo } from "./JsiVideo";
import { throwNotImplementedOnRNWeb } from "./Host";
export const JsiSkApi = CanvasKit => ({
  Point: (x, y) => new JsiSkPoint(CanvasKit, Float32Array.of(x, y)),
  RuntimeShaderBuilder: _ => {
    return throwNotImplementedOnRNWeb();
  },
  RRectXY: (rect, rx, ry) => new JsiSkRRect(CanvasKit, rect, rx, ry),
  RSXform: (scos, ssin, tx, ty) => new JsiSkRSXform(CanvasKit, Float32Array.of(scos, ssin, tx, ty)),
  RSXformFromRadians: (scale, r, tx, ty, px, py) => {
    const s = Math.sin(r) * scale;
    const c = Math.cos(r) * scale;
    return new JsiSkRSXform(CanvasKit, Float32Array.of(c, s, tx - c * px + s * py, ty - s * px - c * py));
  },
  Color,
  ContourMeasureIter: (path, forceClosed, resScale) => new JsiSkContourMeasureIter(CanvasKit, new CanvasKit.ContourMeasureIter(JsiSkPath.fromValue(path), forceClosed, resScale)),
  Paint: () => {
    const paint = new JsiSkPaint(CanvasKit, new CanvasKit.Paint());
    paint.setAntiAlias(true);
    return paint;
  },
  PictureRecorder: () => new JsiSkPictureRecorder(CanvasKit, new CanvasKit.PictureRecorder()),
  Picture: new JsiSkPictureFactory(CanvasKit),
  Path: new JsiSkPathFactory(CanvasKit),
  Matrix: matrix => new JsiSkMatrix(CanvasKit, matrix ? Float32Array.of(...matrix) : Float32Array.of(...CanvasKit.Matrix.identity())),
  ColorFilter: new JsiSkColorFilterFactory(CanvasKit),
  Font: (typeface, size) => new JsiSkFont(CanvasKit, new CanvasKit.Font(typeface === undefined ? null : JsiSkTypeface.fromValue(typeface), size)),
  Typeface: new JsiSkTypefaceFactory(CanvasKit),
  MaskFilter: new JsiSkMaskFilterFactory(CanvasKit),
  RuntimeEffect: new JsiSkRuntimeEffectFactory(CanvasKit),
  ImageFilter: new JsiSkImageFilterFactory(CanvasKit),
  Shader: new JsiSkShaderFactory(CanvasKit),
  PathEffect: new JsiSkPathEffectFactory(CanvasKit),
  MakeVertices: MakeVertices.bind(null, CanvasKit),
  Data: new JsiSkDataFactory(CanvasKit),
  Image: new JsiSkImageFactory(CanvasKit),
  AnimatedImage: new JsiSkAnimatedImageFactory(CanvasKit),
  SVG: new JsiSkSVGFactory(CanvasKit),
  TextBlob: new JsiSkTextBlobFactory(CanvasKit),
  XYWHRect: (x, y, width, height) => {
    return new JsiSkRect(CanvasKit, CanvasKit.XYWHRect(x, y, width, height));
  },
  Surface: new JsiSkSurfaceFactory(CanvasKit),
  TypefaceFontProvider: new JsiSkTypefaceFontProviderFactory(CanvasKit),
  FontMgr: new JsiSkFontMgrFactory(CanvasKit),
  ParagraphBuilder: new JsiSkParagraphBuilderFactory(CanvasKit),
  NativeBuffer: new JsiSkNativeBufferFactory(CanvasKit),
  Video: createVideo.bind(null, CanvasKit),
  Context: (_surface, _width, _height) => {
    return throwNotImplementedOnRNWeb();
  },
  Recorder: () => {
    return throwNotImplementedOnRNWeb();
  }
});
//# sourceMappingURL=JsiSkia.js.map