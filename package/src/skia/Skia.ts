/*global SkiaApi*/
import "./NativeSetup";
import type { SkiaApi as SkSkiaApi } from "./SkiaApi";

/**
 * Declares the SkiaApi as an available object in the global scope
 */
declare global {
  var SkiaApi: SkSkiaApi;
}

/**
 * Declares the implemented API with overrides.
 */
export const Skia = {
  // Factories
  Typeface: SkiaApi.Typeface,
  MaskFilter: SkiaApi.MaskFilter,
  RuntimeEffect: SkiaApi.RuntimeEffect,
  Shader: SkiaApi.Shader,
  ImageFilter: SkiaApi.ImageFilter,
  PathEffect: SkiaApi.PathEffect,
  Data: SkiaApi.Data,
  SVG: SkiaApi.SVG,
  FontMgr: SkiaApi.FontMgr,
  TextBlob: SkiaApi.TextBlob,
  // Constructors
  Matrix: SkiaApi.Matrix,
  Font: SkiaApi.Font,
  Point: SkiaApi.Point,
  XYWHRect: SkiaApi.XYWHRect,
  RRectXY: SkiaApi.RRectXY,
  Paint: SkiaApi.Paint,
  PictureRecorder: SkiaApi.PictureRecorder,
  Picture: SkiaApi.Picture,
  Path: SkiaApi.Path,
  ColorFilter: SkiaApi.ColorFilter,
  ContourMeasureIter: SkiaApi.ContourMeasureIter,
  parseColorString: SkiaApi.parseColorString,
  RSXform: SkiaApi.RSXform,
  // For the following methods the factory symmetry is broken to be comptatible with CanvasKit
  MakeSurface: SkiaApi.Surface.Make,
  MakeImageFromEncoded: SkiaApi.Image.MakeImageFromEncoded,
  MakeImage: SkiaApi.Image.MakeImage,
  MakeVertices: SkiaApi.MakeVertices,
};
