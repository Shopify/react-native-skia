import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Blur, Circle, Group } from "../../components";
import { importSkia, surface } from "../setup";

const blur = 30;

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
    checkImage(image, "snapshots/drawings/blend-mode-multiply.png");
  });

  it("Should use a blur image filter", async () => {
    const { width, height } = surface;
    const r = width * 0.33;
    const image = await surface.draw(
      <Group blendMode="multiply">
        <Blur blur={blur} />
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    checkImage(image, "snapshots/drawings/blur.png");
  });

  it("Shouldn't pass a test if the images are different", async () => {
    const { width, height } = surface;
    const r = width * 0.33;
    const image = await surface.draw(
      <Group blendMode="multiply">
        <Blur blur={blur + 3} />
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    const diff = checkImage(image, "snapshots/drawings/blur.png", false, true);
    expect(diff).not.toBe(0);
  });

  it("Should render a transform with the correct origin", async () => {
    const { Skia } = importSkia();
    const { width, height } = surface;
    const r = width * 0.33;
    const image = await surface.draw(
      <Group
        blendMode="multiply"
        transform={[{ rotate: Math.PI }]}
        origin={Skia.Point(width / 2, height / 2)}
      >
        <Circle cx={r} cy={r} r={r} color={Skia.Color("cyan")} />
        <Circle cx={width - r} cy={r} r={r} color={Skia.Color("magenta")} />
        <Circle
          cx={width / 2}
          cy={height - r}
          r={r}
          color={Skia.Color("yellow")}
        />
      </Group>
    );
    checkImage(image, "snapshots/drawings/transform-origin.png");
  });
});
