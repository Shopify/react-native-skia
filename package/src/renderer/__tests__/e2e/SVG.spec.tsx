import React from "react";

import { checkImage, docPath, itRunsE2eOnly } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { Fill, Group, ImageSVG, fitbox } from "../../components";

// Because SkSVG doesn't exist on web
// This instance is just to send the svg over the wire
const svgWithSize = {
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

const svgWithoutSize = {
  __typename__: "SVG" as const,
  width() {
    return -1;
  },
  height() {
    return -1;
  },
  dispose() {},
  source() {
    return `<svg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='10' cy='10' r='10' fill='#00FFFF'/>
  </svg>`;
  },
};

describe("Displays SVGs", () => {
  itRunsE2eOnly("should render the SVG scaled properly", async () => {
    const { rect } = importSkia();
    const { width, height } = surface;

    const src = rect(0, 0, svgWithSize.width(), svgWithSize.height());
    const dst = rect(0, 0, width, height);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group transform={fitbox("contain", src, dst)}>
          <ImageSVG svg={svgWithSize} />
        </Group>
      </>
    );
    checkImage(image, docPath("svg.png"));
  });

  itRunsE2eOnly("should set the SVG base layer", async () => {
    const { width, height } = surface;
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <ImageSVG svg={svgWithoutSize} width={width} height={height} />
      </>
    );
    checkImage(image, docPath("svg.png"));
  });

  itRunsE2eOnly("should set the SVG base layer", async () => {
    const { width, height } = surface;
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <ImageSVG
          svg={svgWithoutSize}
          x={width / 2}
          y={height / 2}
          width={width / 2}
          height={height / 2}
        />
      </>
    );
    checkImage(image, docPath("svg2.png"));
  });

  itRunsE2eOnly(
    "should set the SVG base layer using the rect prop",
    async () => {
      const { Skia } = importSkia();
      const { width, height } = surface;
      const image = await surface.draw(
        <>
          <Fill color="white" />
          <ImageSVG
            svg={svgWithoutSize}
            rect={Skia.XYWHRect(width / 2, height / 2, width / 2, height / 2)}
          />
        </>
      );
      checkImage(image, docPath("svg2.png"));
    }
  );
});
