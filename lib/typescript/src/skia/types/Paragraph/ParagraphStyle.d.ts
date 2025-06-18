import type { SkTextFontStyle, SkTextStyle } from "./TextStyle";
export declare enum TextDirection {
    RTL = 0,
    LTR = 1
}
export declare enum TextAlign {
    Left = 0,
    Right = 1,
    Center = 2,
    Justify = 3,
    Start = 4,
    End = 5
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
export declare enum TextHeightBehavior {
    All = 0,
    DisableFirstAscent = 1,
    DisableLastDescent = 2,
    DisableAll = 3
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
