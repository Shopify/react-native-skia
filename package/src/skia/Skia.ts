/*global SkiaApi*/
import type { ImageFilterFactory } from "./ImageFilter";
import type { PathFactory } from "./Path";
import type { ColorFilterFactory } from "./ColorFilter";
import type { Font } from "./Font";
import type { Typeface, TypefaceFactory } from "./Typeface";
import type { ImageFactory } from "./Image";
import type { MaskFilterFactory } from "./MaskFilter";
import type { IPaint } from "./Paint";
import type { IRect } from "./Rect";
import type { IRRect } from "./RRect";
import type { RuntimeEffectFactory } from "./RuntimeEffect";
import type { ShaderFactory } from "./Shader";
import { Color } from "./Color";
import type { Matrix } from "./Matrix";
import type { PathEffectFactory } from "./PathEffect";
import type { IPoint } from "./Point";
import type { DataFactory } from "./Data";
import type { SVGFactory } from "./SVG";
import type { FontMgrFactory } from "./FontMgr/FontMgrFactory";

/**
 * Declares the interface for the native Skia API
 */
export interface Skia {
  Point: (x: number, y: number) => IPoint;
  XYWHRect: (x: number, y: number, width: number, height: number) => IRect;
  RRectXY: (rect: IRect, rx: number, ry: number) => IRRect;
  Paint: () => IPaint;
  Path: PathFactory;
  Matrix: () => Matrix;
  ColorFilter: ColorFilterFactory;
  Font: (typeface?: Typeface, size?: number) => Font;
  Typeface: TypefaceFactory;
  MaskFilter: MaskFilterFactory;
  RuntimeEffect: RuntimeEffectFactory;
  ImageFilter: ImageFilterFactory;
  Shader: ShaderFactory;
  PathEffect: PathEffectFactory;
  Data: DataFactory;
  Image: ImageFactory;
  SVG: SVGFactory;
  FontMgr: FontMgrFactory;
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
  SVG: SkiaApi.SVG,
  FontMgr: SkiaApi.FontMgr,
  Color,
  // Here symmetry is broken to be comptatible with CanvasKit
  MakeImageFromEncoded: SkiaApi.Image.MakeFromEncoded,
};
