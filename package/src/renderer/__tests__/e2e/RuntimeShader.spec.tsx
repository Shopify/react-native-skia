import React from "react";

import { surface, importSkia, images } from "../setup";
import {
  Circle,
  Fill,
  Group,
  Paint,
  RuntimeShader,
  Image,
} from "../../components";
import { checkImage, itRunsE2eOnly } from "../../../__tests__/setup";

const passThrough = `
uniform shader image;

half4 main(float2 xy) {
  return image.eval(xy);
}
`;

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
        <Group transform={[{ scale: 1 / 3 }]}>
          <Group
            layer={
              <Paint>
                <RuntimeShader
                  source={source}
                  uniforms={{
                    scale: 0.3,
                    center: { x: (width * 3) / 2, y: (height * 3) / 2 },
                    colors: [Skia.Color("red"), Skia.Color("rgb(0, 255, 0)")],
                  }}
                />
              </Paint>
            }
            transform={[{ scale: 3 }]}
          >
            <Fill color="blue" />
          </Group>
        </Group>
      </>
    );
    checkImage(img, "snapshots/runtime-shader/spiral.png", {
      maxPixelDiff: 1,
    });
  });
  itRunsE2eOnly(
    "should be the reference result for the next test (1)",
    async () => {
      const { width, height } = surface;
      const { oslo } = images;
      const img = await surface.draw(
        <>
          <Group>
            <Image
              image={oslo}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="none"
            />
          </Group>
        </>
      );
      checkImage(img, "snapshots/runtime-shader/unscaled-image.png");
    }
  );
  itRunsE2eOnly("should display display the image untouched (1)", async () => {
    const { width, height } = surface;
    const { Skia } = importSkia();
    const { oslo } = images;
    const source = Skia.RuntimeEffect.Make(passThrough)!;
    expect(source).toBeTruthy();
    const img = await surface.draw(
      <Group>
        <Group>
          <RuntimeShader source={source} />
          <Image
            image={oslo}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="none"
          />
        </Group>
      </Group>
    );
    checkImage(img, "snapshots/runtime-shader/unscaled-image.png");
  });
  itRunsE2eOnly(
    "should be the reference result for the next test (2)",
    async () => {
      const { vec } = importSkia();
      const img = await surface.draw(
        <>
          <Group transform={[{ scale: 3 }]}>
            <Circle c={vec(0, 0)} r={25} color="lightblue" />
          </Group>
        </>
      );
      checkImage(img, "snapshots/runtime-shader/scaled-circle.png");
    }
  );
  itRunsE2eOnly("should display display the circle untouched (1)", async () => {
    const { vec } = importSkia();
    const { Skia } = importSkia();
    const source = Skia.RuntimeEffect.Make(passThrough)!;
    expect(source).toBeTruthy();
    const img = await surface.draw(
      <Group>
        <Group transform={[{ scale: 3 }]}>
          <RuntimeShader source={source} />
          <Circle c={vec(0, 0)} r={25} color="lightblue" />
        </Group>
      </Group>
    );
    checkImage(img, "snapshots/runtime-shader/scaled-circle.png");
  });
});
