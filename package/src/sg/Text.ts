export const renderText = (ctx: DrawingContext, props: TextProps) => {
  "worklet";
  const { text, x, y, font } = processText(ctx.Skia, props);
  ctx.canvas.drawText(text, x, y, font, ctx.paint);
};

export const renderTextPath = (ctx: DrawingContext, props: TextPathProps) => {
  "worklet";
  const { text, path, font } = processTextPath(ctx.Skia, props);
  ctx.canvas.drawTextOnPath(text, path, font, ctx.paint);
};

export const renderTextBlob = (ctx: DrawingContext, props: TextBlobProps) => {
  "worklet";
  const { textBlob, x, y } = processTextBlob(ctx.Skia, props);
  ctx.canvas.drawTextBlob(textBlob, x, y, ctx.paint);
};

export const renderGlyphs = (ctx: DrawingContext, props: GlyphsProps) => {
  "worklet";
  const { glyphs, positions, font } = processGlyphs(ctx.Skia, props);
  ctx.canvas.drawGlyphs(glyphs, positions, font, ctx.paint);
};
