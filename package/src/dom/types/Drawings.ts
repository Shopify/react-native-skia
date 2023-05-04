import type {
  FillType,
  SkImage,
  StrokeOpts,
  Vector,
  Color,
  SkPoint,
  BlendMode,
  PointMode,
  VertexMode,
  SkFont,
  SkRRect,
  SkTextBlob,
  SkPicture,
  SkSVG,
  SkPaint,
  SkRect,
  TextHeightBehavior,
  TextDirection,
  TextAlign,
  FontStyle,
  DecorationStyle,
  StrutStyle,
  TextFontFeatures,
  TextFontVariations,
  TextShadow,
  TextBaseline,
} from "../../skia/types";

import type {
  CircleDef,
  Fit,
  GroupProps,
  PathDef,
  RectDef,
  RRectDef,
  SkEnum,
} from "./Common";
import type { DrawingContext } from "./DrawingContext";

export interface DrawingNodeProps extends GroupProps {
  paint?: SkPaint;
}

export type ImageProps = DrawingNodeProps &
  RectDef & {
    fit?: Fit;
    image: SkImage | null;
  };

export type CircleProps = CircleDef & DrawingNodeProps;

export interface PathProps extends DrawingNodeProps {
  path: PathDef;
  start: number;
  end: number;
  stroke?: StrokeOpts;
  fillType?: SkEnum<typeof FillType>;
}

export interface CustomDrawingNodeProps extends DrawingNodeProps {
  drawing: (ctx: DrawingContext) => void;
}

export interface LineProps extends DrawingNodeProps {
  p1: Vector;
  p2: Vector;
}

export type OvalProps = RectDef & DrawingNodeProps;

export type RectProps = RectDef & DrawingNodeProps;

export type RoundedRectProps = RRectDef & DrawingNodeProps;

export interface CubicBezierHandle {
  pos: Vector;
  c1: Vector;
  c2: Vector;
}

export interface PatchProps extends DrawingNodeProps {
  colors?: Color[];
  patch: [
    CubicBezierHandle,
    CubicBezierHandle,
    CubicBezierHandle,
    CubicBezierHandle
  ];
  texture?: readonly [SkPoint, SkPoint, SkPoint, SkPoint];
  blendMode?: SkEnum<typeof BlendMode>;
}

export interface VerticesProps extends DrawingNodeProps {
  colors?: string[];
  vertices: SkPoint[];
  textures?: SkPoint[];
  mode: SkEnum<typeof VertexMode>;
  blendMode?: SkEnum<typeof BlendMode>;
  indices?: number[];
}

export type ImageSVGProps = RectDef & {
  svg: SkSVG | null;
} & DrawingNodeProps;

export interface PictureProps extends DrawingNodeProps {
  picture: SkPicture;
}

export interface PointsProps extends DrawingNodeProps {
  points: SkPoint[];
  mode: SkEnum<typeof PointMode>;
}

export interface DiffRectProps extends DrawingNodeProps {
  inner: SkRRect;
  outer: SkRRect;
}

export interface TextProps extends DrawingNodeProps {
  font: SkFont | null;
  text: string;
  x: number;
  y: number;
}

export interface TextPathProps extends DrawingNodeProps {
  font: SkFont | null;
  text: string;
  path: PathDef;
  initialOffset: number;
}

export interface TextBlobProps extends DrawingNodeProps {
  blob: SkTextBlob;
  x: number;
  y: number;
}

export interface Glyph {
  id: number;
  pos: SkPoint;
}

export interface GlyphsProps extends DrawingNodeProps {
  font: SkFont | null;
  x: number;
  y: number;
  glyphs: Glyph[];
}

export interface BoxProps extends DrawingNodeProps {
  box: SkRRect | SkRect;
}

export interface BoxShadowProps {
  dx?: number;
  dy?: number;
  spread?: number;
  blur: number;
  color?: Color;
  inner?: boolean;
}

export interface ParagraphStyleProps {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textAlign?: SkEnum<typeof TextAlign>;
  textDirection?: SkEnum<typeof TextDirection>;
  textHeightBehavior?: SkEnum<typeof TextHeightBehavior>;
}

export interface TextStyleProps {
  backgroundColor?: Color;
  color?: Color;
  decoration?: number;
  decorationColor?: Color;
  decorationThickness?: number;
  decorationStyle?: SkEnum<typeof DecorationStyle>;
  fontFamilies?: string[];
  fontFeatures?: TextFontFeatures[];
  fontSize?: number;
  fontStyle?: SkEnum<typeof FontStyle>;
  fontVariations?: TextFontVariations[];
  foregroundColor?: Color;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: TextShadow[];
  textBaseline?: SkEnum<typeof TextBaseline>;
  wordSpacing?: number;
}

export interface RichTextProps
  extends DrawingNodeProps,
    ParagraphStyleProps,
    TextStyleProps {
  x: number;
  y: number;
  width: number;
}

export interface SpanProps extends TextStyleProps {
  text?: string;
  foregroundPaint?: SkPaint;
  backgroundPaint?: SkPaint;
}
