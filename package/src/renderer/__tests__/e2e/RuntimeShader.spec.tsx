import React from "react";

import { surface, importSkia } from "../setup";
import { Circle, Fill, Group, RuntimeShader } from "../../components";
import { checkImage, itRunsE2eOnly } from "../../../__tests__/setup";

const spiral = `
uniform float scale;
uniform float2   center;
uniform float4 colors[2];
uniform shader image;

half4 main(float2 p) {
    float2 pp = p - center;
    float radius = sqrt(dot(pp, pp));
    radius = sqrt(radius);
    float angle = atan(pp.y / pp.x);
    float t = (angle + 3.1415926/2) / (3.1415926);
    t += radius * scale;
    t = fract(t);
    return half4(mix(image.eval(vec2(0, 0)), colors[1], t));
}`;

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
  itRunsE2eOnly("should display a green and red spiral", async () => {
    const { width, height } = surface;
    const { Skia } = importSkia();
    const source = Skia.RuntimeEffect.Make(spiral)!;
    expect(source).toBeTruthy();
    const img = await surface.draw(
      <>
        <Group>
          <RuntimeShader
            source={source}
            uniforms={{
              scale: 0.6,
              center: { x: width / 2, y: height / 2 },
              colors: [
                [1, 0, 0, 1], // red
                [0, 1, 0, 1], // green
              ],
            }}
          />
          <Fill color="blue" />
        </Group>
      </>
    );
    checkImage(img, "snapshots/runtime-shader/spiral.png", {
      maxPixelDiff: 1,
    });
  });
});
