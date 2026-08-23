import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Fill, Group, RoundedRect, Shadow } from "../../components";
import { importSkia, surface } from "../setup";

// An inner shadow is generated outside the shape and clipped back into it, so
// "outside" has to be the complement of the shape's silhouette. Taking SrcOut
// against the source graphic makes it the complement of the source's alpha
// instead: inside a translucent shape 1 - alpha is non-zero, so the shadow is
// generated across the whole interior and tints it - even when the blur and the
// offset are both zero (issue #2990).
//
// None of the references below is drawn with a shadow, so none of them encodes
// the behaviour under test.

const REF_TRANSLUCENT = "snapshots/drawings/inner-shadow-translucent.png";
const REF_TRANSLUCENT_CENTER =
  "snapshots/drawings/inner-shadow-translucent-center.png";
const REF_OPAQUE = "snapshots/drawings/inner-shadow-opaque.png";

const shape = (color: string, children?: React.ReactNode) => (
  <RoundedRect x={32} y={32} width={192} height={192} r={24} color={color}>
    {children}
  </RoundedRect>
);

const TRANSLUCENT = "rgba(255,0,0,0.5)";
const OPAQUE = "rgb(255,0,0)";

describe("Inner shadow", () => {
  it("Build reference result", async () => {
    const image = await surface.draw(
      <>
        <Fill color="white" />
        {shape(TRANSLUCENT)}
      </>
    );
    checkImage(image, REF_TRANSLUCENT);
  });

  it("should be a no-op without blur and offset on a translucent shape", async () => {
    // Nothing outside the shape is moved or spread into it, so there is nothing
    // to draw.
    const image = await surface.draw(
      <>
        <Fill color="white" />
        {shape(
          TRANSLUCENT,
          <Shadow inner dx={0} dy={0} blur={0} color="black" />
        )}
      </>
    );
    checkImage(image, REF_TRANSLUCENT);
  });

  it("Build opaque reference result", async () => {
    const image = await surface.draw(
      <>
        <Fill color="white" />
        {shape(OPAQUE)}
      </>
    );
    checkImage(image, REF_OPAQUE);
  });

  it("should be a no-op without blur and offset on an opaque shape", async () => {
    // Regression guard: the opaque case is already a no-op and has to stay one.
    const image = await surface.draw(
      <>
        <Fill color="white" />
        {shape(OPAQUE, <Shadow inner dx={0} dy={0} blur={0} color="black" />)}
      </>
    );
    checkImage(image, REF_OPAQUE);
  });

  it("Build centered reference result", async () => {
    const { rect } = importSkia();
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group clip={rect(80, 80, 96, 96)}>{shape(TRANSLUCENT)}</Group>
      </>
    );
    checkImage(image, REF_TRANSLUCENT_CENTER);
  });

  it("should stay within reach of the blur on a translucent shape", async () => {
    // The center of the shape is 48px away from its closest edge, far outside
    // the reach of a 4px blur, so the shadow cannot touch it.
    const { rect } = importSkia();
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group clip={rect(80, 80, 96, 96)}>
          {shape(
            TRANSLUCENT,
            <Shadow inner dx={0} dy={0} blur={4} color="black" />
          )}
        </Group>
      </>
    );
    checkImage(image, REF_TRANSLUCENT_CENTER);
  });
});
