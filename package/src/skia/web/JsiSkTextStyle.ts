import type { CanvasKit, TextStyle } from "canvaskit-wasm";

import type {
  FontSlant,
  FontWeight,
  FontWidth,
  SkColor,
  SkTextStyle,
  TextDecoration,
  TextDecorationStyle,
} from "../types";

import { HostObject } from "./Host";

export class JsiSkTextStyle
  extends HostObject<TextStyle, "TextStyle">
  implements SkTextStyle
{
  constructor(CanvasKit: CanvasKit, ref: TextStyle) {
    super(CanvasKit, ref, "TextStyle");
  }
  setDecorationType(decoration: TextDecoration): SkTextStyle {
    this.ref.decoration = decoration;
    return this;
  }
  setDecorationColor(color: Float32Array): SkTextStyle {
    this.ref.color = color;
    return this;
  }
  setDecorationThickness(thickness: number): SkTextStyle {
    this.ref.decorationThickness = thickness;
    return this;
  }
  setDecorationStyle(style: TextDecorationStyle): SkTextStyle {
    this.ref.decorationStyle = { value: style };
    return this;
  }

  getDecorationType() {
    return this.ref.decoration;
  }
  getDecorationColor() {
    return this.ref.color ? (this.ref.decorationColor as SkColor) : undefined;
  }
  getDecorationThickness() {
    return this.ref.decorationThickness;
  }
  getDecorationStyle() {
    return this.ref.decorationStyle?.value;
  }

  getColor(): SkColor | undefined {
    return this.ref.color ? (this.ref.color as SkColor) : undefined;
  }
  getFontSize() {
    return this.ref.fontSize;
  }
  getFontFamilies() {
    return this.ref.fontFamilies;
  }
  getBackgroundColor(): SkColor | undefined {
    return this.ref.backgroundColor
      ? (this.ref.backgroundColor as SkColor)
      : undefined;
  }
  getFontWeight() {
    return this.ref.fontStyle?.weight?.value;
  }
  getFontWidth() {
    return this.ref.fontStyle?.width?.value;
  }
  getFontSlant() {
    return this.ref.fontStyle?.slant?.value;
  }
  getLetterSpacing() {
    return this.ref.letterSpacing;
  }
  getWordSpacing() {
    return this.ref.wordSpacing;
  }
  setColor(color: SkColor): SkTextStyle {
    this.ref.color = color;
    return this;
  }
  setFontSize(fontSize: number): SkTextStyle {
    this.ref.fontSize = fontSize;
    return this;
  }
  setFontFamilies(fontFamilies: string[]): SkTextStyle {
    this.ref.fontFamilies = fontFamilies;
    return this;
  }
  setBackgroundColor(color: SkColor): SkTextStyle {
    this.ref.backgroundColor = color;
    return this;
  }
  setFontWeight(fontWeight: FontWeight): SkTextStyle {
    this.ref.fontStyle = {
      ...(this.ref.fontStyle ?? {}),
      weight: { value: fontWeight },
    };
    return this;
  }
  setFontWidth(fontWidth: FontWidth): SkTextStyle {
    this.ref.fontStyle = {
      ...(this.ref.fontStyle ?? {}),
      width: { value: fontWidth },
    };
    return this;
  }
  setFontSlant(fontSlant: FontSlant): SkTextStyle {
    this.ref.fontStyle = {
      ...(this.ref.fontStyle ?? {}),
      slant: { value: fontSlant },
    };
    return this;
  }
  setLetterSpacing(letterSpacing: number): SkTextStyle {
    this.ref.letterSpacing = letterSpacing;
    return this;
  }
  setWordSpacing(wordSpacing: number): SkTextStyle {
    this.ref.wordSpacing = wordSpacing;
    return this;
  }
  dispose() {
    // Do nothing - Text styles are not disposable in CanvasKit
  }
}
