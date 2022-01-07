/*global SkiaApi*/

import type { ImageFilterFactory } from "./ImageFilter";
import type { PathFactory } from "./Path";
import type { ColorFilterFactory } from "./ColorFilter";
import type { Font } from "./Font";
import type { FontStyle, Typeface } from "./Typeface";
import type { IImage } from "./Image";
import { ImageCtor } from "./Image";
import type { MaskFilterFactory } from "./MaskFilter";
import type { IPaint } from "./Paint";
import type { IRect } from "./Rect";
import type { IRRect } from "./RRect";
import type { RuntimeEffectFactory } from "./RuntimeEffect";
import type { ShaderFactory } from "./Shader";
import type { ISvgStatic } from "./SVG";
import { SvgObject } from "./SVG";
import { Color } from "./Color";
import type { Matrix } from "./Matrix";
import type { PathEffectFactory } from "./PathEffect";
import type { IPoint } from "./Point";
import type { SurfaceFactory } from "./Surface";

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
  Typeface:
    | ((fontName?: string, style?: FontStyle) => Typeface)
    | (() => Typeface);
  MaskFilter: MaskFilterFactory;
  RuntimeEffect: RuntimeEffectFactory;
  ImageFilter: ImageFilterFactory;
  Shader: ShaderFactory;
  PathEffect: PathEffectFactory;
  Surface: SurfaceFactory;
  /* Below are private APIs */
  Image: (localUri: string) => Promise<IImage>;
  Svg: ISvgStatic;
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
  Matrix: SkiaApi.Matrix,
  Color,
  Image: ImageCtor,
  Svg: SvgObject,
  Surface: SkiaApi.Surface,
};
