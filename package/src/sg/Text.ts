import type {
  GlyphsProps,
  TextBlobProps,
  TextPathProps,
  TextProps,
} from "../dom/types";

import type { DrawingContext } from "./Context";

export const renderText = (_ctx: DrawingContext, _props: TextProps) => {
  "worklet";
  // const { text, x, y, font } = processText(ctx.Skia, props);
  // ctx.canvas.drawText(text, x, y, font, ctx.paint);
  throw new Error("Not implemented");
};

export const renderTextPath = (_ctx: DrawingContext, _props: TextPathProps) => {
  "worklet";
  // const { text, path, font } = processTextPath(ctx.Skia, props);
  // ctx.canvas.drawTextOnPath(text, path, font, ctx.paint);
  throw new Error("Not implemented");
};

export const renderTextBlob = (_ctx: DrawingContext, _props: TextBlobProps) => {
  "worklet";
  // const { textBlob, x, y } = processTextBlob(ctx.Skia, props);
  // ctx.canvas.drawTextBlob(textBlob, x, y, ctx.paint);
  throw new Error("Not implemented");
};

export const renderGlyphs = (_ctx: DrawingContext, _props: GlyphsProps) => {
  "worklet";
  // const { glyphs, positions, font } = processGlyphs(ctx.Skia, props);
  // ctx.canvas.drawGlyphs(glyphs, positions, font, ctx.paint);
  throw new Error("Not implemented");
};
