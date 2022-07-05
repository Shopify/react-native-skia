/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Color, Skia as SkiaApi, SkRect, Vector } from "../skia/types";
import * as Values from "../values/web";
import * as ValuesHooks from "../values/hooks";
import * as BaseSkia from "../skia/types";
import type * as SkiaExports from "../skia";
import type * as ExternalExports from "../external";
import type * as ValueExports from "../values";
import type * as AnimationExports from "../animation";
import { useSharedValueEffect } from "../external/reanimated/useSharedValueEffect";
import * as timingFunctions from "../animation/timing";
import * as springFunctions from "../animation/spring";
import * as decayFunctions from "../animation/decay";
import * as interpolateFn from "../animation/functions/interpolate";
import * as interpolatePathFn from "../animation/functions/interpolatePaths";
import * as interpolateVectorFn from "../animation/functions/interpolateVector";

const Noop: () => any = () => {};

export const Skia: SkiaApi = {
  Point: Noop,
  XYWHRect: Noop,
  RuntimeShaderBuilder: Noop,
  RRectXY: Noop,
  RSXform: Noop,
  Color: Noop,
  ContourMeasureIter: Noop,
  Paint: Noop,
  PictureRecorder: Noop,
  Picture: {
    MakePicture: Noop,
  },
  Path: {
    Make: Noop,
    MakeFromSVGString: Noop,
    MakeFromOp: Noop,
    MakeFromCmds: Noop,
    MakeFromText: Noop,
  },
  Matrix: Noop,
  ColorFilter: {
    MakeMatrix: Noop,
    MakeBlend: Noop,
    MakeCompose: Noop,
    MakeLerp: Noop,
    MakeLinearToSRGBGamma: Noop,
    MakeSRGBToLinearGamma: Noop,
    MakeLumaColorFilter: Noop,
  },
  Font: Noop,
  Typeface: {
    MakeFreeTypeFaceFromData: Noop,
  },
  MaskFilter: {
    MakeBlur: Noop,
  },
  RuntimeEffect: {
    Make: Noop,
  },
  ImageFilter: {
    MakeOffset: Noop,
    MakeDisplacementMap: Noop,
    MakeShader: Noop,
    MakeBlur: Noop,
    MakeColorFilter: Noop,
    MakeCompose: Noop,
    MakeDropShadow: Noop,
    MakeDropShadowOnly: Noop,
    MakeErode: Noop,
    MakeDilate: Noop,
    MakeBlend: Noop,
    MakeRuntimeShader: Noop,
  },
  Shader: {
    MakeLinearGradient: Noop,
    MakeRadialGradient: Noop,
    MakeTwoPointConicalGradient: Noop,
    MakeSweepGradient: Noop,
    MakeTurbulence: Noop,
    MakeFractalNoise: Noop,
    MakeBlend: Noop,
    MakeColor: Noop,
  },
  PathEffect: {
    MakeCorner: Noop,
    MakeDash: Noop,
    MakeDiscrete: Noop,
    MakeCompose: Noop,
    MakeSum: Noop,
    MakeLine2D: Noop,
    MakePath1D: Noop,
    MakePath2D: Noop,
  },
  MakeVertices: Noop,
  Data: {
    fromURI: Noop,
    fromBytes: Noop,
    fromBase64: Noop,
  },
  Image: {
    MakeImageFromEncoded: Noop,
    MakeImage: Noop,
  },
  SVG: {
    MakeFromData: Noop,
    MakeFromString: Noop,
  },
  FontMgr: {
    RefDefault: Noop,
  },
  TextBlob: {
    MakeFromText: Noop,
    MakeFromGlyphs: Noop,
    MakeFromRSXform: Noop,
    MakeFromRSXformGlyphs: Noop,
  },
  Surface: {
    Make: Noop,
  },
};

export const vec = (x?: number, y?: number) => ({ x: x ?? 0, y: y ?? x ?? 0 });

const Mock: typeof SkiaExports &
  typeof ExternalExports &
  typeof ValueExports &
  typeof AnimationExports = {
  // SkiaExports
  // 1. Skia API. BaseSkia contains the enums, and functions like isPaint etc
  Skia,
  ...BaseSkia,
  // 2. Hooks
  useDataCollection: Noop,
  useRawData: Noop,
  useData: Noop,
  useFont: Noop,
  useTypeface: Noop,
  useImage: Noop,
  usePath: Noop,
  useSVG: Noop,
  useTextPath: Noop,
  usePaint: Noop,
  usePicture: Noop,
  useSvgPath: Noop,
  // 3. Point/Rect/Transform utilities
  vec,
  rect: (x: number, y: number, width: number, height: number) => ({
    x,
    y,
    width,
    height,
  }),
  rrect: (r: SkRect, rx: number, ry: number) => ({
    rect: r,
    rx,
    ry,
  }),
  point: vec,
  add: (a: Vector, b: Vector) => vec(a.x + b.x, a.y + b.y),
  sub: (a: Vector, b: Vector) => vec(a.x - b.x, a.y - b.y),
  neg: (a: Vector) => vec(-a.x, -a.y),
  dist: (a: Vector, b: Vector) => Math.hypot(a.x - b.x, a.y - b.y),
  translate: ({ x, y }: Vector) =>
    [{ translateX: x }, { translateY: y }] as const,

  bounds: Noop,
  topLeft: Noop,
  topRight: Noop,
  bottomLeft: Noop,
  bottomRight: Noop,
  center: Noop,
  processTransform2d: Noop,
  // ExternalExports
  useSharedValueEffect,
  // ValueExports
  ...Values,
  ...ValuesHooks,
  // Animations
  ...timingFunctions,
  ...springFunctions,
  ...decayFunctions,
  ...interpolateFn,
  ...interpolatePathFn,
  ...interpolateVectorFn,
  interpolateColors: (
    _value: number,
    _inputRange: number[],
    _outputRange: Color[]
  ) => Float32Array.of(0, 0, 0, 0),
  mixColors: (_v: number, _x: Color, _y: Color) => Float32Array.of(0, 0, 0, 0),
};

// eslint-disable-next-line import/no-default-export
export default Mock;
