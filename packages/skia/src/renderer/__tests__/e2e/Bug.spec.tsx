import React from "react";

import { checkImage, docPath } from "../../../__tests__/setup";
import { Fill, Shader } from "../../components";
import { importSkia, surface } from "../setup";

describe("Test Shader component", () => {
  it("should display a mix of red and lightblue from custom shaders", async () => {
    const { Skia } = importSkia();
    const colorSelection = Skia.RuntimeEffect.Make(`uniform shader child1;
uniform shader child2;

vec4 main(vec2 pos) {
  vec4 c1 = child1.eval(pos);
  vec4 c2 = child2.eval(pos);
  return mix(c1, c2, 0.5);
}`)!;
    expect(colorSelection).toBeDefined();
    const colorShader = Skia.RuntimeEffect.Make(`
uniform vec4 color;

vec4 main(vec2 pos) {
  return color;
}
`)!;
    expect(colorShader).toBeDefined();
    const img = await surface.draw(
      <Fill>
        <Shader source={colorSelection}>
          <Shader
            source={colorShader}
            uniforms={{ color: Skia.Color("lightblue") }}
          />
          <Shader
            source={colorShader}
            uniforms={{ color: Skia.Color("red") }}
          />
        </Shader>
      </Fill>
    );
    checkImage(img, docPath("shaders/mixed-colors.png"));
  });
});
