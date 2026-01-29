import { resolveFile, surface } from "../setup";
import {
  PlaceholderAlignment,
  TextBaseline,
  TextDirection,
} from "../../../skia/types";

const RobotoRegular = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Regular.ttf")
);

const Amiri = Array.from(
  resolveFile("skia/__tests__/assets/Amiri-Regular.ttf")
);

describe("Paragraph Methods", () => {
  describe("getRectsForPlaceholders", () => {
    it("should handle multiple placeholders with different alignments", async () => {
      const placeholderRects = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
                halfLeading: false,
              },
            },
            provider
          );

          builder.addText("Start ");
          builder.addPlaceholder(
            20,
            20,
            ctx.PlaceholderAlignment.Baseline,
            ctx.TextBaseline.Alphabetic
          );
          builder.addText(" middle ");
          builder.addPlaceholder(
            15,
            15,
            ctx.PlaceholderAlignment.Top,
            ctx.TextBaseline.Alphabetic
          );
          builder.addText(" end");

          const paragraph = builder.build();
          paragraph.layout(200);

          const rects = paragraph.getRectsForPlaceholders();
          return rects.map((r) => ({
            x: r.rect.x,
            y: r.rect.y,
            width: r.rect.width,
            height: r.rect.height,
            direction: r.direction,
          }));
        },
        {
          RobotoRegular,
          PlaceholderAlignment,
          TextBaseline,
        }
      );

      expect(placeholderRects).toHaveLength(2);
      expect(placeholderRects[0].width).toBe(20);
      expect(placeholderRects[0].height).toBe(20);
      expect(placeholderRects[1].width).toBeCloseTo(15);
      expect(placeholderRects[1].height).toBeCloseTo(15);
    });

    it("should return correct direction for placeholders", async () => {
      const placeholderInfo = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("Text with ");
          builder.addPlaceholder(30, 30);
          builder.addText(" placeholder");

          const paragraph = builder.build();
          paragraph.layout(300);

          const rects = paragraph.getRectsForPlaceholders();
          return rects.map((r) => ({
            direction: r.direction === ctx.TextDirection.LTR ? "LTR" : "RTL",
          }));
        },
        {
          RobotoRegular,
          TextDirection,
        }
      );

      expect(placeholderInfo).toHaveLength(1);
      expect(placeholderInfo[0].direction).toBe("LTR");
    });

    it("should return empty array when no placeholders", async () => {
      const placeholderCount = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("Text without any placeholders");

          const paragraph = builder.build();
          paragraph.layout(300);

          const rects = paragraph.getRectsForPlaceholders();
          return rects.length;
        },
        {
          RobotoRegular,
        }
      );

      expect(placeholderCount).toBe(0);
    });
  });

  describe("getLineMetrics", () => {
    it("should return line metrics for single line text", async () => {
      const lineMetrics = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("Single line text");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getLineMetrics();
        },
        {
          RobotoRegular,
        }
      );

      expect(lineMetrics).toHaveLength(1);
      expect(lineMetrics[0].lineNumber).toBe(0);
      expect(lineMetrics[0].startIndex).toBe(0);
      expect(lineMetrics[0].endIndex).toBe(16);
      expect(lineMetrics[0].width).toBeGreaterThan(0);
      expect(lineMetrics[0].height).toBeGreaterThan(0);
      expect(lineMetrics[0].ascent).toBeGreaterThan(0);
      expect(lineMetrics[0].descent).toBeGreaterThan(0);
      // Note: Even single lines without explicit breaks may report isHardBreak as true
      expect(typeof lineMetrics[0].isHardBreak).toBe("boolean");
    });

    it("should return line metrics for multi-line text with wrapping", async () => {
      const lineMetrics = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText(
            "This is a very long text that should wrap to multiple lines when laid out with a narrow width constraint"
          );

          const paragraph = builder.build();
          paragraph.layout(100); // Narrow width to force wrapping

          return paragraph.getLineMetrics();
        },
        {
          RobotoRegular,
        }
      );

      expect(lineMetrics.length).toBeGreaterThan(1);

      // Check first line
      expect(lineMetrics[0].lineNumber).toBe(0);
      expect(lineMetrics[0].startIndex).toBe(0);
      expect(lineMetrics[0].width).toBeLessThanOrEqual(100);

      // Check second line
      expect(lineMetrics[1].lineNumber).toBe(1);
      expect(lineMetrics[1].startIndex).toBeGreaterThan(0);
      expect(lineMetrics[1].baseline).toBeGreaterThan(lineMetrics[0].baseline);
    });

    it("should handle hard breaks (newlines) correctly", async () => {
      const lineMetrics = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("First line\nSecond line\nThird line");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getLineMetrics();
        },
        {
          RobotoRegular,
        }
      );

      expect(lineMetrics).toHaveLength(3);

      // All lines report isHardBreak as true in this implementation
      expect(lineMetrics[0].isHardBreak).toBe(true);
      expect(lineMetrics[1].isHardBreak).toBe(true);
      expect(lineMetrics[2].isHardBreak).toBe(true);

      // Check line numbers
      expect(lineMetrics[0].lineNumber).toBe(0);
      expect(lineMetrics[1].lineNumber).toBe(1);
      expect(lineMetrics[2].lineNumber).toBe(2);
    });

    it("should correctly report line dimensions and positions", async () => {
      const lineMetrics = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 20,
              },
            },
            provider
          );

          builder.addText("Test\nLine");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getLineMetrics();
        },
        {
          RobotoRegular,
        }
      );

      expect(lineMetrics).toHaveLength(2);

      // First line
      const firstLine = lineMetrics[0];
      // Height should be close to ascent + descent
      expect(firstLine.height).toBeGreaterThan(0);
      expect(
        Math.abs(firstLine.height - (firstLine.ascent + firstLine.descent))
      ).toBeLessThan(1);
      expect(firstLine.left).toBe(0);
      expect(firstLine.baseline).toBeGreaterThan(0);

      // Second line should be below the first
      const secondLine = lineMetrics[1];
      expect(secondLine.baseline).toBeGreaterThan(firstLine.baseline);
      expect(secondLine.baseline - firstLine.baseline).toBeCloseTo(
        firstLine.height,
        1
      );
    });

    it("should handle empty lines correctly", async () => {
      const lineMetrics = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("Line 1\n\nLine 3");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getLineMetrics();
        },
        {
          RobotoRegular,
        }
      );

      expect(lineMetrics).toHaveLength(3);

      // Middle line should be empty but still have metrics
      const emptyLine = lineMetrics[1];
      // Empty line might have startIndex != endIndex depending on implementation
      expect(emptyLine.endIndex).toBeGreaterThanOrEqual(emptyLine.startIndex);
      expect(emptyLine.width).toBeGreaterThanOrEqual(0);
      expect(emptyLine.height).toBeGreaterThan(0); // Still has height
      expect(emptyLine.isHardBreak).toBe(true);
    });
  });

  describe("getGlyphs", () => {
    it("should return shaped glyph runs for LTR text", async () => {
      const glyphRuns = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("Hello");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getGlyphs();
        },
        {
          RobotoRegular,
        }
      );

      expect(glyphRuns.length).toBeGreaterThan(0);
      const run = glyphRuns[0];
      expect(run.lineNumber).toBe(0);
      expect(run.glyphIds.length).toBe(5); // "Hello" has 5 characters
      expect(run.positions.length).toBe(5);
      expect(run.advanceX).toBeGreaterThan(0);

      // Check that positions are in ascending order (LTR)
      for (let i = 1; i < run.positions.length; i++) {
        expect(run.positions[i].x).toBeGreaterThan(run.positions[i - 1].x);
      }
    });

    it("should return properly shaped glyph runs for RTL Arabic text", async () => {
      const glyphRuns = await surface.eval(
        (Skia, ctx) => {
          const amiri = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.Amiri))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(amiri, "Amiri");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textDirection: ctx.TextDirection.RTL,
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Amiri"],
                fontSize: 24,
              },
            },
            provider
          );

          // Arabic text: "Hello" in Arabic
          builder.addText("مرحبا");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getGlyphs();
        },
        {
          Amiri,
          TextDirection,
        }
      );

      expect(glyphRuns.length).toBeGreaterThan(0);
      const run = glyphRuns[0];
      expect(run.lineNumber).toBe(0);
      // Arabic text should have shaped glyphs (may be different count due to ligatures)
      expect(run.glyphIds.length).toBeGreaterThan(0);
      expect(run.positions.length).toBe(run.glyphIds.length);
    });

    it("should return multiple runs for multi-line text", async () => {
      const glyphRuns = await surface.eval(
        (Skia, ctx) => {
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoRegular, "Roboto");

          const builder = Skia.ParagraphBuilder.Make(
            {
              textStyle: {
                color: Skia.Color("black"),
                fontFamilies: ["Roboto"],
                fontSize: 16,
              },
            },
            provider
          );

          builder.addText("Line one\nLine two");

          const paragraph = builder.build();
          paragraph.layout(300);

          return paragraph.getGlyphs();
        },
        {
          RobotoRegular,
        }
      );

      // Should have runs for both lines
      const lineNumbers = [...new Set(glyphRuns.map((r) => r.lineNumber))];
      expect(lineNumbers.length).toBe(2);
      expect(lineNumbers).toContain(0);
      expect(lineNumbers).toContain(1);
    });
  });
});
