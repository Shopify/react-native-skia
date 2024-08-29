import type { SkTextFontStyle, SkTextStyle } from "./TextStyle";

export enum TextDirection {
  RTL = 0,
  LTR = 1,
}
export enum TextAlign {
  Left = 0,
  Right,
  Center,
  Justify,
  Start,
  End,
}

export interface SkStrutStyle {
  strutEnabled?: boolean;
  fontFamilies?: string[];
  fontStyle?: SkTextFontStyle;
  fontSize?: number;
  heightMultiplier?: number;
  halfLeading?: boolean;
  leading?: number;
  forceStrutHeight?: boolean;
}

export enum TextHeightBehavior {
  All = 0x0,
  DisableFirstAscent = 0x1,
  DisableLastDescent = 0x2,
  DisableAll = 0x1 | 0x2,
}

export interface SkParagraphStyle {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  replaceTabCharacters?: boolean;
  strutStyle?: SkStrutStyle;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textHeightBehavior?: TextHeightBehavior;
  textStyle?: SkTextStyle;
}
