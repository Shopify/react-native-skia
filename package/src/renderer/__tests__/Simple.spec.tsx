import React from "react";

import { processResult } from "../../__tests__/setup";
import { Group, Rect } from "../components";
import * as SkiaRenderer from "../index";

import { center, drawOnNode, width } from "./setup";

const size = 128;

describe("Renderer", () => {
  it("Loads renderer without Skia", () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Light blue rectangle", () => {
    const surface = drawOnNode(
      <Rect
        x={(width - size) / 2}
        y={(width - size) / 2}
        width={size}
        height={size}
        color="lightblue"
      />
    );
    processResult(surface, "snapshots/drawings/lightblue-rect.png");
  });
  it("Scaled light blue rectangle", () => {
    const scaled = size / 2;
    const surface = drawOnNode(
      <Group transform={[{ scale: 2 }]} origin={center}>
        <Rect
          x={(width - scaled) / 2}
          y={(width - scaled) / 2}
          width={scaled}
          height={scaled}
          color="lightblue"
        />
      </Group>
    );
    processResult(surface, "snapshots/drawings/lightblue-rect.png");
  });
});
