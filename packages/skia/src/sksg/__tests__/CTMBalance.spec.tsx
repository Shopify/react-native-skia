import React from "react";

import { importSkia } from "../../renderer/__tests__/setup";
import { SkiaSGRoot } from "../Reconciler";
import type { SkImage } from "../../skia/types";

// A CTM that saves nothing must not emit a restore, otherwise it pops the save
// of an enclosing group and every later sibling loses that group's transform.
// Each case below wraps a sibling in a group whose only CTM prop is inert, and
// checks that the sibling is still drawn translated by the parent group.

const SIZE = 256;
const SHIFT = 128;

const readColorAt = (image: SkImage, x: number, y: number) => {
  const pixels = image.readPixels() as Uint8Array;
  const i = (y * image.width() + x) * 4;
  return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
};

const drawScene = async (inert: Record<string, unknown>) => {
  const { Skia } = importSkia();
  const root = new SkiaSGRoot(Skia);
  await root.render(
    <skGroup transform={[{ translateX: SHIFT }]}>
      {/* the group under test: its CTM props do not save the canvas */}
      <skGroup {...inert}>
        <skRect rect={{ x: 0, y: 0, width: 64, height: 64 }} color="red" />
      </skGroup>
      {/* sibling: must still be translated by the enclosing group */}
      <skRect rect={{ x: 0, y: 64, width: 64, height: 64 }} color="blue" />
    </skGroup>
  );
  const surface = Skia.Surface.Make(SIZE, SIZE)!;
  root.drawOnCanvas(surface.getCanvas());
  surface.flush();
  const image = surface.makeImageSnapshot();
  root.unmount();
  return image;
};

const expectSiblingIsTranslated = (image: SkImage) => {
  // blue sibling drawn at y = 64, expected at x = SHIFT and nowhere near x = 0
  expect(readColorAt(image, SHIFT + 32, 96)).toEqual([0, 0, 255, 255]);
  expect(readColorAt(image, 32, 96)).toEqual([0, 0, 0, 0]);
};

describe("CTM save/restore balance", () => {
  it("no CTM props at all (control)", async () => {
    expectSiblingIsTranslated(await drawScene({}));
  });

  it("origin without transform or matrix", async () => {
    expectSiblingIsTranslated(await drawScene({ origin: { x: 0, y: 0 } }));
  });

  it("clip resolved to false by a conditional", async () => {
    expectSiblingIsTranslated(await drawScene({ clip: false }));
  });

  it("invertClip without a clip", async () => {
    expectSiblingIsTranslated(await drawScene({ invertClip: false }));
  });

  it("still restores for a CTM that does save", async () => {
    const image = await drawScene({ transform: [{ translateX: 32 }] });
    // the inner group's own translate applies to the red rect only...
    expect(readColorAt(image, SHIFT + 32 + 16, 32)).toEqual([255, 0, 0, 255]);
    // ...and is restored before the sibling is drawn
    expectSiblingIsTranslated(image);
  });
});
