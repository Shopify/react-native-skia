import { resolveFile, surface } from "../setup";
import {
  checkImage,
  docPath,
  itRunsE2eOnly,
  itRunsNodeOnly,
} from "../../../__tests__/setup";
import {
  FontStyle,
  SkTextAlign,
  SkTextDirection,
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
  resolveFile("skia/__tests__/assets/NotoColorEmoji-Regular.ttf")
);

describe("Paragraphs", () => {
  itRunsNodeOnly(
    "Should build the first example from the documentation",
    async () => {
      const img = await surface.drawParagraph(
        (Skia, ctx) => {
          const robotoMedium = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoMedium))
          )!;
          const robotoRegular = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoRegular))
          )!;
          const noto = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.Noto))
          )!;
          const provider = Skia.TypefaceFontProvider.Make();
          provider.registerFont(robotoMedium, "Roboto");
          provider.registerFont(robotoRegular, "Roboto");
          provider.registerFont(noto, "Noto");
          const textStyle = {
            color: Skia.Color("black"),
            fontFamilies: ["Roboto", "Noto"],
            fontSize: 50,
          };
          return Skia.ParagraphBuilder.MakeFromFontProvider(provider)
            .pushStyle(textStyle)
            .addText("Say Hello to ")
            .pushStyle({ ...textStyle, fontStyle: { weight: 500 } })
            .addText("Skia 🎨")
            .pop()
            .build();
        },
        surface.width,
        { RobotoRegular, RobotoMedium, Noto }
      );
      checkImage(img, docPath(`paragraph/hello-world-${surface.OS}.png`));
    }
  );
  itRunsNodeOnly(
    "Should build the example from the documentation with text styles",
    async () => {
      const img = await surface.drawParagraph(
        (Skia, ctx) => {
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
          return Skia.ParagraphBuilder.MakeFromFontProvider(provider)
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
        },
        surface.width,
        {
          RobotoRegular,
          RobotoBold,
          RobotoItalic,
          Bold: FontStyle.Bold,
          Normal: FontStyle.Normal,
          Italic: FontStyle.Italic,
        }
      );
      checkImage(img, docPath(`paragraph/font-style-${surface.OS}.png`));
    }
  );
  itRunsE2eOnly("should render simple paragraph", async () => {
    const img = await surface.drawParagraph((Skia) => {
      return Skia.ParagraphBuilder.MakeFromSystem()
        .pushStyle({ color: Skia.Color("black") })
        .addText("Hello from Skia!")
        .build();
    });
    checkImage(img, `snapshots/paragraph/simple-paragraph-${surface.OS}.png`);
  });
  it("should render simple paragraph with custom font", async () => {
    const img = await surface.drawParagraph(
      (Skia, ctx) => {
        const tf = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.Pacifico))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(tf, "Pacifico");
        return Skia.ParagraphBuilder.MakeFromFontProvider(provider)
          .pushStyle({
            fontFamilies: ["Pacifico"],
            fontSize: 50,
            color: Skia.Color("blakc"),
          })
          .addText("Hello from Skia!")
          .build();
      },
      surface.width,
      { Pacifico }
    );
    checkImage(
      img,
      `snapshots/paragraph/simple-paragraph-with-provider-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should render paragraph linebreaks", async () => {
    const img = await surface.drawParagraph((Skia) =>
      Skia.ParagraphBuilder.MakeFromSystem()
        .pushStyle({ color: Skia.Color("black") })
        .addText("Hello\nfrom Skia")
        .build()
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-linebreaks-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should break when line is long", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.MakeFromSystem()
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello from a really, really long line - and from Skia!")
          .build(),
      50
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-auto-linebreaks-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text to the right", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.MakeFromSystem({
          textAlign,
        })
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello Skia!")
          .build(),
      surface.width,
      { textAlign: SkTextAlign.Right }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-right-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text centered", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.MakeFromSystem({
          textAlign,
        })
          .pushStyle({ color: Skia.Color("black") })
          .addText("Hello Skia!")
          .build(),
      surface.width,
      { textAlign: SkTextAlign.Center }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-center-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text justified", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textAlign }) =>
        Skia.ParagraphBuilder.MakeFromSystem({
          textAlign,
          textStyle: {
            color: Skia.Color("black"),
          },
        })
          .addText(
            "Hello Skia this text should be justified - what do you think? Is it justified?"
          )
          .build(),
      surface.width,
      { textAlign: SkTextAlign.Justify }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-justify-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should align text left", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.MakeFromSystem({
          textStyle: {
            color: Skia.Color("black"),
          },
        })
          .addText(
            "Hello Skia this text should be justified - what do you think? Is it justified?"
          )
          .build(),
      surface.width
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-left-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should render text right to left", async () => {
    const img = await surface.drawParagraph(
      (Skia, { textDirection }) =>
        Skia.ParagraphBuilder.MakeFromSystem({
          textDirection,
          textStyle: {
            color: Skia.Color("black"),
          },
        })
          .addText("Hello Skia RTL\nThis is a new line")
          .build(),
      150,
      { textDirection: SkTextDirection.RTL }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-align-rtl-${surface.OS}.png`
    );
  });

  itRunsE2eOnly(
    "should show ellipse when line count is above max lines",
    async () => {
      const img = await surface.drawParagraph(
        (Skia, { maxLines, ellipsis }) =>
          Skia.ParagraphBuilder.MakeFromSystem({
            maxLines,
            ellipsis,
            textStyle: {
              color: Skia.Color("black"),
            },
          })
            .addText("Hello Skia - maxLine is 1!")
            .build(),
        50,
        { maxLines: 1, ellipsis: "..." }
      );
      checkImage(
        img,
        `snapshots/paragraph/paragraph-ellipse-${surface.OS}.png`
      );
    }
  );

  itRunsE2eOnly("should use textstyle in paraphstyle", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.MakeFromSystem()
          .pushStyle({ color: Skia.Color("red") })
          .addText("Hello Skia!")
          .build(),
      50
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-in-paragraph-style-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support colors", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.MakeFromSystem()
          .pushStyle({ color: Skia.Color("red") })
          .addText("Hello Skia in red color")
          .pop()
          .pushStyle({ backgroundColor: Skia.Color("blue") })
          .addText("Hello Skia in blue backgroundcolor")
          .pop()
          .pushStyle({ foregroundColor: Skia.Color("yellow") })
          .addText("Hello Skia with yellow foregroundcolor")
          .pop()
          .build(),
      150
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-colors-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support text decoration", async () => {
    const img = await surface.drawParagraph(
      (Skia, { Overline, LineThrough, Underline }) =>
        Skia.ParagraphBuilder.MakeFromSystem()
          .pushStyle({
            decoration: Underline,
            decorationColor: Skia.Color("blue"),
            color: Skia.Color("black"),
          })
          .addText("Hello Skia with blue underline")
          .pop()
          .pushStyle({
            decoration: LineThrough,
            decorationColor: Skia.Color("red"),
            color: Skia.Color("black"),
          })
          .addText("Hello Skia with red strike-through")
          .pop()
          .pushStyle({
            decoration: Overline,
            decorationColor: Skia.Color("green"),
            color: Skia.Color("black"),
          })
          .addText("Hello Skia with green overline")
          .pop()
          .build(),
      150,
      {
        Overline: TextDecoration.Overline,
        LineThrough: TextDecoration.LineThrough,
        Underline: TextDecoration.Underline,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-decoration-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support font styling", async () => {
    const img = await surface.drawParagraph(
      (Skia, { Italic, Bold, BoldItalic }) =>
        Skia.ParagraphBuilder.MakeFromSystem()
          .pushStyle({ fontStyle: Italic, color: Skia.Color("black") })
          .addText("Hello Skia in italic")
          .pop()
          .pushStyle({ fontStyle: Bold, color: Skia.Color("black") })
          .addText("Hello Skia in bold")
          .pop()
          .pushStyle({ fontStyle: BoldItalic, color: Skia.Color("black") })
          .addText("Hello Skia in bold-italic")
          .pop()
          .build(),
      150,
      {
        Italic: FontStyle.Italic,
        Bold: FontStyle.Bold,
        BoldItalic: FontStyle.BoldItalic,
      }
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-style-${surface.OS}.png`
    );
  });

  itRunsE2eOnly("should support font shadows", async () => {
    const img = await surface.drawParagraph(
      (Skia) =>
        Skia.ParagraphBuilder.MakeFromSystem()
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
          .build(),
      150
    );
    checkImage(
      img,
      `snapshots/paragraph/paragraph-text-style-font-shadow-${surface.OS}.png`
    );
  });
});
