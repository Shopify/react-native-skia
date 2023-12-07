import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Group, Rect } from "../../components";
import { importSkia, surface } from "../setup";
import { processTransform3d } from "../../../skia/types";

describe("Matrix4", () => {
  it("Should do a perspective transformation", async () => {
    const { Skia } = importSkia();
    const { width, height } = surface;
    const pad = 32;
    const rct = {
      x: pad,
      y: pad,
      width: width - pad * 2,
      height: height - pad * 2,
    };
    // todo: accept { translate: [width/2, height/2] }
    const m3 = Skia.Matrix(
      processTransform3d([
        { translateX: width / 2 },
        { translateY: height / 2 },
        { perspective: 300 },
        { rotateX: 1 },
        { translateX: -width / 2 },
        { translateY: -height / 2 },
      ])
    );

    const image = await surface.draw(
      <Group>
        <Rect rect={rct} color="magenta" />
        <Rect rect={rct} color="cyan" opacity={0.5} matrix={m3} />
      </Group>
    );
    checkImage(image, "snapshots/matrix4/perspective.png");
  });
});
