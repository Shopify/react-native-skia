import type { SkColor } from "../Color";
import type { FontSlant, FontWeight, FontWidth } from "../Font";
import type { SkPoint } from "../Point";

export enum TextDecoration {
  NoDecoration = 0x0,
  Underline = 0x1,
  Overline = 0x2,
  LineThrough = 0x4,
}

export enum TextDecorationStyle {
  Solid = 0,
  Double,
  Dotted,
  Dashed,
  Wavy,
}

export interface SkTextShadow {
  color?: SkColor;
  /**
   * 2d array for x and y offset. Defaults to [0, 0]
   */
  offset?: SkPoint;
  blurRadius?: number;
}

export interface SkTextFontFeatures {
  name: string;
  value: number;
}

export interface SkTextFontStyle {
  weight?: FontWeight;
  width?: FontWidth;
  slant?: FontSlant;
}

export interface SkTextFontVariations {
  axis: string;
  value: number;
}

export enum TextBaseline {
  Alphabetic = 0,
  Ideographic,
}

export interface SkTextStyle {
  backgroundColor?: SkColor;
  color?: SkColor;
  decoration?: TextDecoration;
  decorationColor?: SkColor;
  decorationThickness?: number;
  decorationStyle?: TextDecorationStyle;
  fontFamilies?: string[];
  fontFeatures?: SkTextFontFeatures[];
  fontSize?: number;
  fontStyle?: SkTextFontStyle;
  fontVariations?: SkTextFontVariations[];
  foregroundColor?: SkColor;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: SkTextShadow[];
  textBaseline?: TextBaseline;
  wordSpacing?: number;
}
