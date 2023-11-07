import type { ParagraphStyle } from "canvaskit-wasm";

import { type SkParagraphStyle } from "../types";

export class JsiSkParagraphStyle {
  static toParagraphStyle(value: SkParagraphStyle): ParagraphStyle {
    return {
      disableHinting: value.disableHinting,
      ellipsis: value.ellipsis,
      heightMultiplier: value.heightMultiplier,
      maxLines: value.maxLines,
      replaceTabCharacters: value.replaceTabCharacters,
      textAlign: value.textAlign ? { value: value.textAlign } : undefined,
      textDirection: value.textDirection
        ? { value: value.textDirection }
        : undefined,
      textHeightBehavior: value.textHeightBehavior
        ? { value: value.textHeightBehavior }
        : undefined,
      strutStyle: value.strutStyle
        ? {
            fontFamilies: value.strutStyle.fontFamilies,
            fontSize: value.strutStyle.fontSize,
            heightMultiplier: value.strutStyle.heightMultiplier,
            leading: value.strutStyle.leading,
            forceStrutHeight: value.strutStyle.forceStrutHeight,
            fontStyle: {
              slant: value.strutStyle.fontStyle?.slant
                ? { value: value.strutStyle.fontStyle.slant }
                : undefined,

              width: value.strutStyle.fontStyle?.width
                ? { value: value.strutStyle.fontStyle.width }
                : undefined,

              weight: value.strutStyle.fontStyle?.weight
                ? { value: value.strutStyle.fontStyle.weight }
                : undefined,
            },
            halfLeading: value.strutStyle.halfLeading,
            strutEnabled: value.strutStyle.strutEnabled,
          }
        : undefined,
    };
  }
}
