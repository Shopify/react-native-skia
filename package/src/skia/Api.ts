/*global SkiaApi*/
import type { ProcessedColorValue } from "react-native";

import type { IImageFilters } from "./ImageFilter";
import type { IGradientShader } from "./GradientShader";
import type { IPath } from "./Path";
import type { IColorFilter } from "./ColorFilter";
import type { IFont } from "./Font";
import type { IImage } from "./Image";
import { ImageCtor } from "./Image";
import type { BlurStyle, IMaskFilter } from "./MaskFilter";
import type { IPaint } from "./Paint";
import type { IRect } from "./Rect";
import type { IRuntimeEffect, RuntimeEffectType } from "./RuntimeEffect";
import type { IShader } from "./Shader";
import type { FontStyle, ITypeface } from "./Typeface";
import type { ISvgStatic } from "./Svg";
import { SvgObject } from "./Svg";
import { Color } from "./Color";
import type { IMatrix } from "./Matrix";

/**
 * Declares the interface for the native Skia API
 */
export interface ISkiaNativeApi {
  PixelRatio: number;
  Rect: (x: number, y: number, width: number, height: number) => IRect;
  Paint: () => IPaint;
  Path: () => IPath;
  Matrix: () => IMatrix;
  ColorFilter: (matrix: number[]) => IColorFilter;
  Font: (typeface?: ITypeface, size?: number) => IFont;
  Typeface:
    | ((fontName?: string, style?: FontStyle) => ITypeface)
    | (() => ITypeface);
  MaskFilter: (blurStyle: BlurStyle, sigma: number) => IMaskFilter;
  RuntimeEffects: (sksl: string, type: RuntimeEffectType) => IRuntimeEffect;
  Shader: (color: ProcessedColorValue | null | undefined) => IShader;
  ImageFilters: IImageFilters;
  GradientShader: IGradientShader;
  /* Below are private APIs */
  Image: (localUri: string) => Promise<IImage>;
  Svg: ISvgStatic;
}

/**
 * Declares the SkiaApi as an available object in the global scope
 */
declare global {
  var SkiaApi: ISkiaNativeApi;
}

/**
 * Declares the implemented API with overrides.
 */
export const Api = {
  PixelRatio: SkiaApi.PixelRatio,
  Rect: SkiaApi.Rect,
  Paint: SkiaApi.Paint,
  Path: SkiaApi.Path,
  ColorFilter: SkiaApi.ColorFilter,
  Font: SkiaApi.Font,
  Typeface: SkiaApi.Typeface,
  MaskFilter: SkiaApi.MaskFilter,
  RuntimeEffects: SkiaApi.RuntimeEffects,
  Shader: SkiaApi.Shader,
  ImageFilters: SkiaApi.ImageFilters,
  GradientShader: SkiaApi.GradientShader,
  Matrix: SkiaApi.Matrix,
  Color,
  Image: ImageCtor,
  Svg: SvgObject,
};
