import React from "react";

import {
  checkImage,
  itRunsCIAndNodeOnly,
  itRunsE2eOnly,
} from "../../../__tests__/setup";
import { Fill, Group, Rect, Text, TextPath } from "../../components";
import { fonts, importSkia, surface } from "../setup";

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

  it("Should draw text along a path", async () => {
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
});
