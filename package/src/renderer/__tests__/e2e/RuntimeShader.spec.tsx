import React from "react";

import { surface, importSkia } from "../setup";
import { Circle, Group, RuntimeShader } from "../../components";
import { checkImage, itRunsE2eOnly } from "../../../__tests__/setup";

describe("Runtime Shader", () => {
  itRunsE2eOnly("should use the sdf of a circle", async () => {
    const { Skia } = importSkia();
    const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {
  vec4 color =  image.eval(xy);
  if (xy.x < 128) {
    return color;
  }
  return color.rbga;
}
    `)!;
    const r = surface.width / 2;
    expect(source).toBeDefined();
    const img = await surface.draw(
      <Group>
        <RuntimeShader source={source} />
        <Circle cx={r} cy={r} r={r} color="lightblue" />
      </Group>
    );
    checkImage(img, "snapshots/runtime-shader/simple.png");
  });
});
