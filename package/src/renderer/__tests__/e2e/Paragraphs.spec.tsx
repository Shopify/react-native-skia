import { resolveFile, surface } from "../setup";
import {
  CI,
  checkImage,
  docPath,
  itRunsE2eOnly,
} from "../../../__tests__/setup";
import {
  FontStyle,
  TextAlign,
  TextDirection,
  TextDecoration,
} from "../../../skia/types";

const Pacifico = Array.from(
  resolveFile("skia/__tests__/assets/Pacifico-Regular.ttf")
);

const RobotoMedium = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Medium.ttf")
);

const RobotoRegular = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Regular.ttf")
);

const RobotoBold = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Bold.ttf")
);

const RobotoItalic = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Italic.ttf")
);

const Noto = Array.from(
  resolveFile("skia/__tests__/assets/NotoColorEmoji.ttf")
);

describe("Paragraphs", () => {
  it("Should build the first example from the documentation", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const robotoMedium = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoMedium))
        )!;
        const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(robotoMedium, "Roboto");
        provider.registerFont(robotoRegular, "Roboto");
        if (ctx.OS === "node") {
          const noto = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.Noto))
          )!;
          provider.registerFont(noto, "Noto");
        }
        const textStyle = {
          color: Skia.Color("black"),
          fontFamilies: ["Roboto", "Noto"],
          fontSize: 50,
        };
        const para = Skia.ParagraphBuilder.Make({}, provider)
          .pushStyle(textStyle)
          .addText("Say Hello to ")
          .pushStyle({ ...textStyle, fontStyle: { weight: 500 } })
          .addText("Skia 🎨")
          .pop()
          .build();
        para.layout(ctx.width);
        para.paint(canvas, 0, 0);
      },
      {
        RobotoRegular,
        RobotoMedium,
        Noto: surface.OS === "node" ? Noto : [],
        OS: surface.OS,
        width: surface.width,
      }
    );
    checkImage(img, docPath(`paragraph/hello-world-${surface.OS}.png`), {
      // In CI, the emoji font is different
      maxPixelDiff: CI ? 15000 : 200,
    });
  });
  it("Should build the example from the documentation with text styles", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const robotoBold = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoBold))
        )!;
        const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
        )!;
        const robotoItalic = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoItalic))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(robotoBold, "Roboto");
        provider.registerFont(robotoRegular, "Roboto");
        provider.registerFont(robotoItalic, "Roboto");
        const textStyle = {
          color: Skia.Color("black"),
          fontFamilies: ["Roboto"],
          fontSize: 24,
        };
        const para = Skia.ParagraphBuilder.Make({}, provider)
          .pushStyle({ ...textStyle, fontStyle: ctx.Bold })
          .addText("This text is bold\n")
          .pop()
          .pushStyle({ ...textStyle, fontStyle: ctx.Normal })
          .addText("This text is regular\n")
          .pop()
          .pushStyle({ ...textStyle, fontStyle: ctx.Italic })
          .addText("This text is italic")
          .pop()
          .build();
        para.layout(ctx.width);
        para.paint(canvas, 0, 0);
      },
      {
        RobotoRegular,
        RobotoBold,
        RobotoItalic,
        Bold: FontStyle.Bold,
        Normal: FontStyle.Normal,
        Italic: FontStyle.Italic,
        width: surface.width,
      }
    );
    checkImage(img, docPath(`paragraph/font-style-${surface.OS}.png`));
  });
  itRunsE2eOnly("should render simple paragraph", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const para = Skia.ParagraphBuilder.Make()
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello from Skia!")
          .build();
        para.layout(ctx.width);
        para.paint(canvas, 0, 0);
      },
      { width: surface.width }
    );
    checkImage(img, `snapshots/paragraph/simple-paragraph-${surface.OS}.png`);
  });
  it("should render simple paragraph with custom font", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const tf = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.Pacifico))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(tf, "Pacifico");
        const para = Skia.ParagraphBuilder.Make({}, provider)
          .pushStyle({
            fontFamilies: ["Pacifico"],
            fontSize: 50,
            color: Skia.Color("blakc"),
          })
          .addText("Hello from Skia!")
          .build();
        para.layout(ctx.width);
        para.paint(canvas, 0, 0);
      },
      { Pacifico, width: surface.width }
    );
    checkImage(
      img,
      `snapshots/paragraph/simple-paragraph-with-provider-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should render paragraph linebreaks", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const para = Skia.ParagraphBuilder.Make()
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello\nfrom Skia")
          .build();
        para.layout(ctx.width);
        para.paint(canvas, 0, 0);
      },
      { width: surface.width }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-linebreaks-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should break when line is long", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const para = Skia.ParagraphBuilder.Make()
        .pushStyle({ color: Skia.Color("black") })
        .addText("Hello from a really, really long line - and from Skia!")
        .build();
      para.layout(50); // Layout width set to 50 as in the original test
      para.paint(canvas, 0, 0);
    });
    checkImage(
      img,
      `snapshots/paragraph/paragraph-auto-linebreaks-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text to the right", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { textAlign, width }) => {
        const para = Skia.ParagraphBuilder.Make({
          textAlign,
        })
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello Skia!")
          .build();
        para.layout(width);
        para.paint(canvas, 0, 0);
      },
      { width: surface.width, textAlign: TextAlign.Right }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-right-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text centered", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { width, textAlign }) => {
        const para = Skia.ParagraphBuilder.Make({
          textAlign,
        })
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello Skia!")
          .build();
        para.layout(width);
        para.paint(canvas, 0, 0);
      },
      { width: surface.width, textAlign: TextAlign.Center }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-center-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text justified", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { textAlign, width }) => {
        const para = Skia.ParagraphBuilder.Make({
          textAlign,
          textStyle: {
            color: Skia.Color("black"),
          },
        })
          .addText(
            "Hello Skia this text should be justified - what do you think? Is it justified?"
          )
          .build();
        para.layout(width);
        para.paint(canvas, 0, 0);
      },
      { textAlign: TextAlign.Justify, width: surface.width }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-justify-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text justified", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { textAlign, width }) => {
        const para = Skia.ParagraphBuilder.Make({
          textAlign,
          textStyle: {
            color: Skia.Color("black"),
          },
        })
          .addText(
            "Hello Skia this text should be justified - what do you think? Is it justified?"
          )
          .build();
        para.layout(width);
        para.paint(canvas, 0, 0);
      },
      { width: surface.width, textAlign: TextAlign.Justify }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-justify-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should render text right to left", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { textDirection }) => {
        const para = Skia.ParagraphBuilder.Make({
          textDirection,
          textStyle: {
            color: Skia.Color("black"),
          },
        })
          .addText("Hello Skia RTL\nThis is a new line")
          .build();
        para.layout(150);
        para.paint(canvas, 0, 0);
      },
      { textDirection: TextDirection.RTL }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-rtl-${surface.OS}.png`
    );
  });

  itRunsE2eOnly(
    "should show ellipse when line count is above max lines",
    async () => {
      const img = await surface.drawOffscreen(
        (Skia, canvas) => {
          const para = Skia.ParagraphBuilder.Make({
            maxLines: 1,
            ellipsis: "...",
            textStyle: {
              color: Skia.Color("black"),
            },
          })
            .addText("Hello Skia - maxLine is 1!")
            .build();
          para.layout(50);
          para.paint(canvas, 0, 0);
        },
        { width: 50 }
      );
      checkImage(
        img,
        `snapshots/paragraph/paragraph-ellipse-${surface.OS}.png`
      );
    }
  );

  itRunsE2eOnly("should use textstyle in paraphstyle", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const para = Skia.ParagraphBuilder.Make()
        .pushStyle({ color: Skia.Color("red") })
        .addText("Hello Skia!")
        .build();
      para.layout(50);
      para.paint(canvas, 0, 0);
    });
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-in-paragraph-style-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support colors", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const para = Skia.ParagraphBuilder.Make()
        .pushStyle({ color: Skia.Color("red") })
        .addText("Hello Skia in red color")
        .pop()
        .pushStyle({ backgroundColor: Skia.Color("blue") })
        .addText("Hello Skia in blue backgroundcolor")
        .pop()
        .pushStyle({ foregroundColor: Skia.Color("yellow") })
        .addText("Hello Skia with yellow foregroundcolor")
        .pop()
        .build();
      para.layout(150);
      para.paint(canvas, 0, 0);
    });
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-colors-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support text decoration", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { underline, overline, lineThrough }) => {
        const para = Skia.ParagraphBuilder.Make()
          .pushStyle({
            decoration: underline,
            decorationColor: Skia.Color("blue"),
            color: Skia.Color("black"),
          })
          .addText("Hello Skia with blue underline")
          .pop()
          .pushStyle({
            decoration: lineThrough,
            decorationColor: Skia.Color("red"),
            color: Skia.Color("black"),
          })
          .addText("Hello Skia with red strike-through")
          .pop()
          .pushStyle({
            decoration: overline,
            decorationColor: Skia.Color("green"),
            color: Skia.Color("black"),
          })
          .addText("Hello Skia with green overline")
          .pop()
          .build();
        para.layout(150);
        para.paint(canvas, 0, 0);
      },
      {
        underline: TextDecoration.Underline,
        lineThrough: TextDecoration.LineThrough,
        overline: TextDecoration.Overline,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-decoration-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support font styling", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { bold, boldItalic, italic }) => {
        const para = Skia.ParagraphBuilder.Make()
          .pushStyle({
            fontStyle: italic,
            color: Skia.Color("black"),
          })
          .addText("Hello Skia in italic")
          .pop()
          .pushStyle({ fontStyle: bold, color: Skia.Color("black") })
          .addText("Hello Skia in bold")
          .pop()
          .pushStyle({
            fontStyle: boldItalic,
            color: Skia.Color("black"),
          })
          .addText("Hello Skia in bold-italic")
          .pop()
          .build();
        para.layout(150);
        para.paint(canvas, 0, 0);
      },
      {
        bold: FontStyle.Bold,
        italic: FontStyle.Italic,
        boldItalic: FontStyle.BoldItalic,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-style-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should draw the bounding box (1)", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, { bold, boldItalic, italic }) => {
        const para = Skia.ParagraphBuilder.Make()
          .pushStyle({
            fontStyle: italic,
            color: Skia.Color("black"),
          })
          .addText("Hello Skia in italic")
          .pop()
          .pushStyle({ fontStyle: bold, color: Skia.Color("black") })
          .addText("Hello Skia in bold")
          .pop()
          .pushStyle({
            fontStyle: boldItalic,
            color: Skia.Color("black"),
          })
          .addText("Hello Skia in bold-italic")
          .pop()
          .build();
        para.layout(150);
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("cyan"));
        canvas.drawRect(
          Skia.XYWHRect(0, 0, para.getMaxWidth(), para.getHeight()),
          paint
        );
        para.paint(canvas, 0, 0);
      },
      {
        bold: FontStyle.Bold,
        italic: FontStyle.Italic,
        boldItalic: FontStyle.BoldItalic,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-style-${surface.OS}-box.png`
    );
  });

  it("should draw the bounding box (2)", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(robotoRegular, "Roboto");
        const para = Skia.ParagraphBuilder.Make({}, provider)
          .pushStyle({
            fontFamilies: ["Roboto"],
            color: Skia.Color("black"),
            fontSize: 30,
          })
          .addText("Say Hello to React Native Skia")
          .pop()
          .build();
        para.layout(150);
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("cyan"));
        const height = para.getHeight();
        const width = para.getLongestLine();
        canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);
        para.paint(canvas, 0, 0);
      },
      {
        RobotoRegular,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-bounding-box-${surface.OS}.png`
    );
  });
  it("should draw the bounding box (3)", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(robotoRegular, "Roboto");
        const para = Skia.ParagraphBuilder.Make({}, provider)
          .pushStyle({
            fontFamilies: ["Roboto"],
            color: Skia.Color("black"),
            fontSize: 30,
          })
          .addText("Say Hello to React Native Skia")
          .pop()
          .build();
        const maxWidth = ctx.canvasWidth * 0.78125;
        para.layout(maxWidth);
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("magenta"));
        const height = para.getHeight();
        const width = para.getLongestLine();
        canvas.drawRect(Skia.XYWHRect(0, 0, maxWidth, ctx.canvasHeight), paint);
        paint.setColor(Skia.Color("cyan"));
        canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);
        para.paint(canvas, 0, 0);
      },
      {
        RobotoRegular,
        canvasWidth: surface.width,
        canvasHeight: surface.height,
      }
    );
    checkImage(img, docPath(`paragraph/boundingbox-${surface.OS}.png`));
  });

  itRunsE2eOnly("should return the paragraph height", async () => {
    const { width, height } = await surface.eval((Skia) => {
      const para = Skia.ParagraphBuilder.Make()
        .pushStyle({
          color: Skia.Color("black"),
          fontSize: 25,
          shadows: [
            {
              color: Skia.Color("#ff000044"),
              blurRadius: 4,
              offset: { x: 4, y: 4 },
            },
          ],
        })
        .addText("Hello Skia with red shadow")
        .build();
      para.layout(150);
      return { height: para.getHeight(), width: para.getMaxWidth() };
    });
    expect(width).toBe(150);
    expect(height).toBeGreaterThan(25);
  });
  itRunsE2eOnly("should support font shadows", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const para = Skia.ParagraphBuilder.Make()
        .pushStyle({
          color: Skia.Color("black"),
          fontSize: 25,
          shadows: [
            {
              color: Skia.Color("#ff000044"),
              blurRadius: 4,
              offset: { x: 4, y: 4 },
            },
          ],
        })
        .addText("Hello Skia with red shadow")
        .build();
      para.layout(150);
      para.paint(canvas, 0, 0);
    });
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-shadow-${surface.OS}.png`
    );
  });
});
