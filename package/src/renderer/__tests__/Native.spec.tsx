import React from "react";

import { checkImage } from "../../__tests__/setup";
import { Circle, Group } from "../components";

import { surface } from "./setup";

describe("Test e2e server", () => {
  it("Should blend colors using multiplication", async () => {
    const { width, height } = surface;
    const r = width * 0.33;
    const image = await surface.draw(
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    checkImage(image, "snapshots/drawings/blend-mode-multiply2.png", true);
  });
});
