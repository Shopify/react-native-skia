import type { CanvasKit, TextStyle as ITextStyle } from "canvaskit-wasm";

import { exhaustiveCheck } from "../../../exhaustiveCheck";
import { processColor } from "../processors/Paint";

type Align = "left" | "center" | "right";

type FontWeight = "light" | "normal" | "semibold" | "bold" | "medium" | "500";

export interface ParagraphStyle {
  textAlign?: Align;
}

export interface TextStyle {
  fontFamilies?: string[];
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  opacity?: number;
  letterSpacing?: number;
}

const weight = (CanvasKit: CanvasKit, w: FontWeight) => {
  switch (w) {
    case "light":
      return CanvasKit.FontWeight.Light;
    case "normal":
      return CanvasKit.FontWeight.Normal;
    case "semibold":
      return CanvasKit.FontWeight.SemiBold;
    case "medium":
      return CanvasKit.FontWeight.Medium;
    case "bold":
      return CanvasKit.FontWeight.Bold;
    case "500":
      return { value: 500 };
    default:
      return exhaustiveCheck(w);
  }
};

const align = (CanvasKit: CanvasKit, a: Align) => {
  switch (a) {
    case "left":
      return CanvasKit.TextAlign.Left;
    case "center":
      return CanvasKit.TextAlign.Center;
    case "right":
      return CanvasKit.TextAlign.Right;
    default:
      return exhaustiveCheck(a);
  }
};

export const paragraphStyle = (
  CanvasKit: CanvasKit,
  textStyle: ITextStyle,
  { textAlign }: ParagraphStyle
) =>
  new CanvasKit.ParagraphStyle({
    textStyle,
    textAlign: align(CanvasKit, textAlign ?? "left"),
  });

export const textStyle = (
  CanvasKit: CanvasKit,
  {
    color,
    opacity,
    fontFamilies,
    fontSize,
    fontWeight,
    letterSpacing,
  }: TextStyle
) => {
  const style: ITextStyle = {};
  if (color !== undefined) {
    style.color = processColor(color, opacity ?? 1);
  }
  if (fontFamilies !== undefined) {
    style.fontFamilies = fontFamilies;
  }
  if (fontSize !== undefined) {
    style.fontSize = fontSize;
  }
  if (fontWeight !== undefined) {
    style.fontStyle = {
      weight: fontWeight ? weight(CanvasKit, fontWeight) : undefined,
    };
  }
  if (letterSpacing !== undefined) {
    style.letterSpacing = letterSpacing;
  }
  return style;
};
