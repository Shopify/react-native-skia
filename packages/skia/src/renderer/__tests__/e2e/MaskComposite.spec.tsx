import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Circle, Fill, Group, Mask, Rect } from "../../components";
import { importSkia, surface } from "../setup";

// <Mask> composites its children onto the mask with srcIn. srcIn replaces the
// destination inside the coverage of the draw it is attached to, so it has to
// be applied once, to the children as a whole - not once per child. Applied per
// draw call, every child after the first is composited against the previous
// child instead of against the mask, and the overlap of two translucent
// children comes out wrong (issue #3254).
//
// Neither reference below is drawn with <Mask>, so neither encodes the
// behaviour under test: one is the plain drawing, the other is the same
// drawing behind a geometric clip.

const REF_PLAIN = "snapshots/drawings/mask-composite-plain.png";
const REF_CLIPPED = "snapshots/drawings/mask-composite-clipped.png";
const REF_SINGLE = "snapshots/drawings/mask-composite-single.png";

// Two overlapping translucent circles: the overlap is only right if they are
// composited against each other before the mask is applied.
const twoChildren = (
  <>
    <Circle cx={96} cy={128} r={60} color="rgba(44,243,228,0.5)" />
    <Circle cx={160} cy={128} r={60} color="rgba(255,181,245,0.5)" />
  </>
);

const singleChild = (
  <Circle cx={128} cy={128} r={72} color="rgba(44,243,228,0.5)" />
);

describe("Mask composition", () => {
  it("Build reference result", async () => {
    const image = await surface.draw(
      <>
        <Fill color="white" />
        {twoChildren}
      </>
    );
    checkImage(image, REF_PLAIN);
  });

  it("should not alter the drawing when the mask is opaque everywhere", async () => {
    // An alpha mask that is opaque everywhere selects the whole drawing, so
    // the result has to be the drawing itself.
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Mask clip={false} mask={<Fill color="white" />}>
          {twoChildren}
        </Mask>
      </>
    );
    checkImage(image, REF_PLAIN);
  });

  it("Build clipped reference result", async () => {
    const { rect } = importSkia();
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group clip={rect(0, 0, 128, 256)}>{twoChildren}</Group>
      </>
    );
    checkImage(image, REF_CLIPPED);
  });

  it("should select the drawing without recompositing it", async () => {
    // A mask that is opaque on the left half and empty on the right half
    // selects exactly what the matching rectangular clip selects.
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Mask
          clip={false}
          mask={<Rect x={0} y={0} width={128} height={256} color="white" />}
        >
          {twoChildren}
        </Mask>
      </>
    );
    checkImage(image, REF_CLIPPED);
  });

  it("Build single child reference result", async () => {
    const image = await surface.draw(
      <>
        <Fill color="white" />
        {singleChild}
      </>
    );
    checkImage(image, REF_SINGLE);
  });

  it("should keep compositing a single child correctly", async () => {
    // Regression guard: with one child both forms agree, and it has to stay
    // that way.
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Mask clip={false} mask={<Fill color="white" />}>
          {singleChild}
        </Mask>
      </>
    );
    checkImage(image, REF_SINGLE);
  });
});
