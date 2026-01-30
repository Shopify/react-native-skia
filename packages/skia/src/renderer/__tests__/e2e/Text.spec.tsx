import React from "react";

import {
  checkImage,
  itRunsCIAndNodeOnly,
  itRunsE2eOnly,
  itSkipsCanvasKit,
} from "../../../__tests__/setup";
import { Fill, Group, Rect, Text, TextPath } from "../../components";
import { fonts, importSkia, resolveFile, surface } from "../setup";

const RobotoMedium = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Medium.ttf")
);

const Amiri = Array.from(
  resolveFile("skia/__tests__/assets/Amiri-Regular.ttf")
);

describe("Text", () => {
  // The NotoColorEmoji font is not supported on iOS
  itRunsCIAndNodeOnly("Glyph emojis", async () => {
    const font = fonts.NotoColorEmoji;
    const result = await surface.eval(
      (_Skia, ctx) => {
        return ctx.font.getGlyphIDs("😉😍");
      },
      { font }
    );
    expect(result).toEqual(surface.OS === "ios" ? [0, 0] : [892, 896]);
  });
  it("Should calculate chinese text width correctly", async () => {
    const font = fonts.NotoSansSCRegular;
    const result = await surface.eval(
      (_Skia, ctx) => {
        return ctx.font.getTextWidth("欢迎");
      },
      { font }
    );
    expect(result).toBe(64);
  });
  itRunsE2eOnly("Should calculate text width correctly", async () => {
    const font = fonts.DinMedium;
    const result = await surface.eval(
      (_Skia, ctx) => {
        return ctx.font.measureText(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do"
        ).width;
      },
      { font }
    );
    expect(result).toBeLessThan(1000);
  });

  itRunsE2eOnly("should draw the text bound measure correctly", async () => {
    const font = fonts.DinMedium;
    const bounds = await surface.eval(
      (_Skia, ctx) => {
        return ctx.font.measureText("Lorem ipsum");
      },
      { font }
    );
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group>
          <Rect
            color="orange"
            x={bounds.x + 0}
            y={bounds.y + 64}
            width={bounds.width}
            height={bounds.height}
          />
          <Text x={0} y={64} text="Lorem ipsum" font={font} />
        </Group>
      </>
    );
    checkImage(image, `snapshots/text/text-bounds-${surface.OS}.png`);
  });

  it("Should draw text along a circle", async () => {
    const font = fonts.RobotoMedium;
    const { Skia } = importSkia();
    const path = Skia.Path.Make();
    const r = surface.width / 2;
    path.addCircle(r, r, r / 2);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group transform={[{ rotate: Math.PI }]} origin={Skia.Point(r, r)}>
          <TextPath font={font} path={path} text="Hello World!" />
        </Group>
      </>
    );
    checkImage(image, `snapshots/text/text-path1-${surface.OS}.png`);
  });

  itSkipsCanvasKit("Should draw text along a path", async () => {
    const font = fonts.NotoSansSCRegular;
    const { Skia } = importSkia();
    const path = Skia.Path.Make();
    const r = surface.width / 2;
    path.addCircle(r, r, r / 2);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group>
          <TextPath
            font={font}
            path="M10,90 Q90,90 90,45 Q90,10 50,10 Q10,10 10,40 Q10,70 45,70 Q70,70 75,50"
            text="Quick brown fox jumps over the lazy dog."
          />
        </Group>
      </>
    );
    checkImage(image, `snapshots/text/text-path2-${surface.OS}.png`);
  });

  itSkipsCanvasKit(
    "Should create a path from text with Roboto font",
    async () => {
      const img = await surface.drawOffscreen(
        (Skia, canvas, ctx) => {
          const roboto = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.RobotoMedium))
          )!;
          const font = Skia.Font(roboto, 64);
          const path = Skia.Path.MakeFromText("Hello", 0, 64, font);
          if (path) {
            const paint = Skia.Paint();
            paint.setColor(Skia.Color("black"));
            canvas.drawColor(Skia.Color("white"));
            canvas.drawPath(path, paint);
          }
        },
        {
          RobotoMedium,
        }
      );
      checkImage(img, `snapshots/text/path-from-text-${surface.OS}.png`);
    }
  );

  itSkipsCanvasKit(
    "Should create a path from Arabic text with Amiri font",
    async () => {
      const img = await surface.drawOffscreen(
        (Skia, canvas, ctx) => {
          const amiri = Skia.Typeface.MakeFreeTypeFaceFromData(
            Skia.Data.fromBytes(new Uint8Array(ctx.Amiri))
          )!;
          const font = Skia.Font(amiri, 64);
          const path = Skia.Path.MakeFromText("مرحبا", 0, 64, font);
          if (path) {
            const paint = Skia.Paint();
            paint.setColor(Skia.Color("black"));
            canvas.drawColor(Skia.Color("white"));
            canvas.drawPath(path, paint);
          }
        },
        {
          Amiri,
        }
      );
      checkImage(img, `snapshots/text/path-from-arabic-text-${surface.OS}.png`);
    }
  );
});
