import fs from "fs";

import React from "react";

import { checkImage, docPath, itRunsE2eOnly } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { Blur, Fill, Group, ImageSVG, Paint, fitbox } from "../../components";
import type { SkSVG } from "../../../skia/types";

// Because SkSVG doesn't exist on web,
// this instance is just to send the svg over the wire
class SVGAsset implements SkSVG {
  __typename__ = "SVG" as const;
  constructor(
    private _source: string,
    private _width: number,
    private _height: number
  ) {}

  dispose() {}

  source() {
    return this._source;
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }
}

const circle = new SVGAsset(
  `<svg viewBox='0 0 20 20' width="20" height="20" xmlns='http://www.w3.org/2000/svg'>
<circle cx='10' cy='10' r='10' fill='#00FFFF'/>
</svg>`,
  20,
  20
);

const tiger = new SVGAsset(
  fs.readFileSync("src/skia/__tests__/assets/tiger.svg", "utf-8"),
  800,
  800
);

describe("Image loading from bundles", () => {
  itRunsE2eOnly("should render png, jpg from bundle", async () => {
    const { rect } = importSkia();
    const { width, height } = surface;

    const src = rect(0, 0, circle.width(), circle.height());
    const dst = rect(0, 0, width, height);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group transform={fitbox("contain", src, dst)}>
          <ImageSVG svg={circle} x={0} y={0} width={20} height={20} />
        </Group>
      </>
    );
    checkImage(image, docPath("svg.png"));
  });

  itRunsE2eOnly("should apply an image filter to the svg", async () => {
    const { rect } = importSkia();
    const { width, height } = surface;

    const src = rect(0, 0, tiger.width(), tiger.height());
    const dst = rect(0, 0, width, height);
    const image = await surface.draw(
      <>
        <Fill color="white" />
        <Group
          transform={fitbox("contain", src, dst)}
          layer={
            <Paint>
              <Blur blur={10} />
            </Paint>
          }
        >
          <ImageSVG svg={tiger} x={0} y={0} width={800} height={800} />
        </Group>
      </>
    );
    checkImage(image, docPath("blurred-tiger.png"));
  });
});
