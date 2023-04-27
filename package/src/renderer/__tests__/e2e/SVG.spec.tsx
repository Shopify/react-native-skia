import React from "react";

import { checkImage, docPath, itRunsE2eOnly } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { Fill, Group, ImageSVG, fitbox } from "../../components";

describe("Image loading from bundles", () => {
  itRunsE2eOnly("should render png, jpg from bundle", async () => {
    const { Skia, rect } = importSkia();
    const { width, height } = surface;
    const svg = Skia.SVG.MakeFromString(
      `<svg viewBox='0 0 290 500' width="290" height="500" xmlns='http://www.w3.org/2000/svg'>
          <circle cx='31' cy='325' r='120px' fill='#c02aaa'/>
        </svg>`
    )!;

    const src = rect(0, 0, svg.width(), svg.height());
    const dst = rect(0, 0, width, height);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group transform={fitbox("contain", src, dst)}>
          <ImageSVG svg={svg} x={0} y={0} width={290} height={500} />
        </Group>
      </>
    );
    checkImage(image, docPath("svg.png"));
  });
});
