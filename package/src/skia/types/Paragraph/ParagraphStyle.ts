import type { SkColor } from "../Color";
import type { FontStyle } from "../Font";

export enum TextAlign {
  Left,
  Right,
  Center,
  Justify,
  Start,
  End,
}

export enum TextBaseline {
  Alphabetic,
  Ideographic,
}

export enum TextDirection {
  RTL,
  LTR,
}

export enum TextHeightBehavior {
  All,
  DisableFirstAscent,
  DisableLastDescent,
  DisableAll,
}

export enum DecorationStyle {
  Solid,
  Double,
  Dotted,
  Dashed,
  Wavy,
}

export enum PlaceholderAlignment {
  Baseline,
  AboveBaseline,
  BelowBaseline,
  Top,
  Bottom,
  Middle,
}

export interface StrutStyle {
  strutEnabled?: boolean;
  fontFamilies?: string[];
  fontStyle?: FontStyle;
  fontSize?: number;
  heightMultiplier?: number;
  halfLeading?: boolean;
  leading?: number;
  forceStrutHeight?: boolean;
}

export interface ParagraphStyle {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textHeightBehavior?: TextHeightBehavior;
  textStyle?: TextStyle;
}

export interface TextFontFeatures {
  name: string;
  value: number;
}

export interface TextFontVariations {
  axis: string;
  value: number;
}

export interface TextShadow {
  color?: SkColor;
  offset?: number[];
  blurRadius?: number;
}

export interface TextStyle {
  backgroundColor?: SkColor;
  color?: SkColor;
  decoration?: number;
  decorationColor?: SkColor;
  decorationThickness?: number;
  decorationStyle?: DecorationStyle;
  fontFamilies?: string[];
  fontFeatures?: TextFontFeatures[];
  fontSize?: number;
  fontStyle?: FontStyle;
  fontVariations?: TextFontVariations[];
  foregroundColor?: SkColor;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: TextShadow[];
  textBaseline?: TextBaseline;
  wordSpacing?: number;
}
