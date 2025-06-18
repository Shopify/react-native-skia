import type { SkColor } from "../Color";
import type { FontSlant, FontWeight, FontWidth } from "../Font";
import type { SkPoint } from "../Point";
export declare enum TextDecoration {
    NoDecoration = 0,
    Underline = 1,
    Overline = 2,
    LineThrough = 4
}
export declare enum TextDecorationStyle {
    Solid = 0,
    Double = 1,
    Dotted = 2,
    Dashed = 3,
    Wavy = 4
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
export declare enum TextBaseline {
    Alphabetic = 0,
    Ideographic = 1
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
