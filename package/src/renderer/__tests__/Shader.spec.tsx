import React from "react";

import { processResult } from "../../__tests__/setup";
import { Fill, Group, ShaderLib } from "../components";
import { Shader } from "../components/shaders/Shader";

import { drawOnNode, Skia, height, width } from "./setup";

const bilinearInterpolation = `
uniform vec4 position;
uniform vec4 colors[4];

vec4 main(vec2 pos) {
  vec2 uv = (pos - vec2(position.x, position.y))/vec2(position.z, position.w);
  vec4 colorA = mix(colors[0], colors[1], uv.x);
  vec4 colorB = mix(colors[2], colors[3], uv.x);
  return mix(colorA, colorB, uv.y);
}`;

const hue = `
uniform float2 c;
uniform float r;

${ShaderLib.Math}
${ShaderLib.Colors}

float quadraticIn(float t) {
  return t * t;
}

half4 main(vec2 uv) { 
  float mag = distance(uv, c);
  float theta = normalizeRad(canvas2Polar(uv, c).x);
  if (mag > r) {
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
  return hsv2rgb(vec3(theta/TAU, quadraticIn(mag/r), 1.0));
}`;

describe("Test Shader component", () => {
  it("should flatten shader uniforms", () => {
    const source = Skia.RuntimeEffect.Make(bilinearInterpolation)!;
    expect(source).toBeTruthy();
    const surface = drawOnNode(
      <Group>
        <Shader
          source={source}
          uniforms={{
            position: [0, 0, width, height],
            colors: ["#dafb61", "#61DAFB", "#fb61da", "#61fbcf"]
              .map(Skia.Color)
              .map(([r, g, b, a]) => [r, g, b, a]),
          }}
        />
        <Fill />
      </Group>
    );
    processResult(surface, "snapshots/shaders/bilinear-interpolation.png");
  });
  it("should display a hue wheel", () => {
    const source = Skia.RuntimeEffect.Make(hue)!;
    expect(source).toBeTruthy();
    const surface = drawOnNode(
      <Group>
        <Shader
          source={source}
          uniforms={{
            c: Skia.Point(width / 2, height / 2),
            r: width / 2,
          }}
        />
        <Fill />
      </Group>
    );
    processResult(surface, "snapshots/shaders/hue.png");
  });
});
