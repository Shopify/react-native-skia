/*global SkiaApi*/
import type { ImageFilterFactory } from "./ImageFilter";
import type { PathFactory } from "./Path";
import type { ColorFilterFactory } from "./ColorFilter";
import type { IFont } from "./Font";
import type { ITypeface, TypefaceFactory } from "./Typeface";
import type { ImageFactory } from "./Image";
import type { MaskFilterFactory } from "./MaskFilter";
import type { IPaint } from "./Paint";
import type { IRect } from "./Rect";
import type { IRRect } from "./RRect";
import type { RuntimeEffectFactory } from "./RuntimeEffect";
import type { ShaderFactory } from "./Shader";
import { Color } from "./Color";
import type { IMatrix } from "./Matrix";
import type { PathEffectFactory } from "./PathEffect";
import type { IPoint } from "./Point";
import type { Vertices, VertexMode } from "./Vertices/Vertices";
import type { DataFactory } from "./Data";
import type { SVGFactory } from "./SVG";
import type { FontMgrFactory } from "./FontMgr/FontMgrFactory";
import type { SurfaceFactory } from "./Surface";
import "./NativeSetup";
import type { IRSXform } from "./RSXform";

/**
 * Declares the interface for the native Skia API
 */
export interface Skia {
  Point: (x: number, y: number) => IPoint;
  XYWHRect: (x: number, y: number, width: number, height: number) => IRect;
  RRectXY: (rect: IRect, rx: number, ry: number) => IRRect;
  RSXform: (scos: number, ssin: number, tx: number, ty: number) => IRSXform;
  Paint: () => IPaint;
  Path: PathFactory;
  Matrix: () => IMatrix;
  ColorFilter: ColorFilterFactory;
  Font: (typeface?: ITypeface, size?: number) => IFont;
  Typeface: TypefaceFactory;
  MaskFilter: MaskFilterFactory;
  RuntimeEffect: RuntimeEffectFactory;
  ImageFilter: ImageFilterFactory;
  Shader: ShaderFactory;
  PathEffect: PathEffectFactory;
  /**
   * Returns an Vertices based on the given positions and optional parameters.
   * See SkVertices.h (especially the Builder) for more details.
   * @param mode
   * @param positions
   * @param textureCoordinates
   * @param colors - either a list of int colors or a flattened color array.
   * @param indices
   * @param isVolatile
   */
  MakeVertices(
    mode: VertexMode,
    positions: IPoint[],
    textureCoordinates?: IPoint[] | null,
    colors?: Color[],
    indices?: number[] | null,
    isVolatile?: boolean
  ): Vertices;
  Data: DataFactory;
  Image: ImageFactory;
  SVG: SVGFactory;
  FontMgr: FontMgrFactory;
  Surface: SurfaceFactory;
}

/**
 * Declares the SkiaApi as an available object in the global scope
 */
declare global {
  var SkiaApi: Skia;
}

/**
 * Declares the implemented API with overrides.
 */
export const Skia = {
  Point: SkiaApi.Point,
  XYWHRect: SkiaApi.XYWHRect,
  RRectXY: SkiaApi.RRectXY,
  Paint: SkiaApi.Paint,
  Path: SkiaApi.Path,
  ColorFilter: SkiaApi.ColorFilter,
  Font: SkiaApi.Font,
  Typeface: SkiaApi.Typeface,
  MaskFilter: SkiaApi.MaskFilter,
  RuntimeEffect: SkiaApi.RuntimeEffect,
  Shader: SkiaApi.Shader,
  ImageFilter: SkiaApi.ImageFilter,
  PathEffect: SkiaApi.PathEffect,
  Data: SkiaApi.Data,
  Matrix: SkiaApi.Matrix,
  MakeVertices: SkiaApi.MakeVertices,
  SVG: SkiaApi.SVG,
  FontMgr: SkiaApi.FontMgr,
  // Here are constructors for data types which are represented as typed arrays in CanvasKit
  Color,
  RSXform: SkiaApi.RSXform,
  // Here the factory symmetry is broken to be comptatible with CanvasKit
  MakeSurface: SkiaApi.Surface.Make,
  MakeImageFromEncoded: SkiaApi.Image.MakeImageFromEncoded,
};
