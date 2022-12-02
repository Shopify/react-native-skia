import React from "react";

import { surface, importSkia } from "../setup";
import { Fill, Shader } from "../../components";
import { checkImage } from "../../../__tests__/setup";

describe("Signed Distance Function", () => {
  it("should use the sdf of a circle", async () => {
    const { Skia } = importSkia();
    const source = Skia.RuntimeEffect.Make(`
uniform float4 c1;
uniform float4 c2;
uniform float4 c3;
uniform float4 c4;

float sdCircle(vec2 p, float r) {
  return length(p)-r;
}

vec4 main(vec2 xy) { 
  vec2 c = vec2(128.0, 128.0);
  float d = sdCircle(xy-c, 128.0);
  return mix(c1, c2, saturate(d));
}
`)!;
    const c1 = Skia.Color("#61dafb");
    const c2 = Skia.Color("#fb61da");
    const c3 = Skia.Color("#61fbcf");
    const c4 = Skia.Color("#dafb61");
    expect(source).toBeDefined();
    const img = await surface.draw(
      <Fill>
        <Shader source={source} uniforms={{ c1, c2, c3, c4 }} />
      </Fill>
    );
    checkImage(img, "snapshots/sdf/circle.png", true);
  });
});
