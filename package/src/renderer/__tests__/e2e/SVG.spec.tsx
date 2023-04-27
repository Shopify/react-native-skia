import React from "react";

import { checkImage, docPath, itRunsE2eOnly } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { Fill, Group, ImageSVG, fitbox } from "../../components";

// Because SkSVG doesn't exist on web
// This instance is just to send the svg over the wire
const svg = {
  __typename__: "SVG" as const,
  width() {
    return 20;
  },
  height() {
    return 20;
  },
  dispose() {},
  source() {
    return `<svg viewBox='0 0 20 20' width="20" height="20" xmlns='http://www.w3.org/2000/svg'>
    <circle cx='10' cy='10' r='10' fill='#00FFFF'/>
  </svg>`;
  },
};

describe("Image loading from bundles", () => {
  itRunsE2eOnly("should render png, jpg from bundle", async () => {
    const { rect } = importSkia();
    const { width, height } = surface;

    const src = rect(0, 0, svg.width(), svg.height());
    const dst = rect(0, 0, width, height);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group transform={fitbox("contain", src, dst)}>
          <ImageSVG svg={svg} x={0} y={0} width={20} height={20} />
        </Group>
      </>
    );
    checkImage(image, docPath("svg.png"));
  });
});
