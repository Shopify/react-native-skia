import {
  importSkia,
  width,
  height,
  loadImage,
} from "../../renderer/__tests__/setup";
import { BlendMode } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { CircleNode } from "../drawings/CircleNode";
import { FillNode } from "../drawings/FillNode";
import { GroupNode } from "../GroupNode";
import { PaintNode } from "../paint/PaintNode";
import { ShaderNode } from "../paint/shaders/Shader";
import { ImageShaderNode } from "../paint/shaders/ImageShaderNode";

describe("Drawings", () => {
  it("Hello World", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec } = importSkia();
    const r = width * 0.33;
    // Root
    const paint = new PaintNode({ blendMode: BlendMode.Multiply });
    const root = new GroupNode({ paint });
    // C1
    const cyan = new PaintNode({ color: Skia.Color("cyan") });
    const c1 = new GroupNode({ paint: cyan });
    c1.addChild(new CircleNode({ c: vec(r, r), r }));
    root.addChild(c1);
    // C2
    const magenta = new PaintNode({ color: Skia.Color("magenta") });
    const c2 = new GroupNode({ paint: magenta });
    c2.addChild(new CircleNode({ c: vec(width - r, r), r }));
    root.addChild(c2);
    // C3
    const yellow = new PaintNode({ color: Skia.Color("yellow") });
    const c3 = new GroupNode({ paint: yellow });
    c3.addChild(new CircleNode({ c: vec(width / 2, height - r), r }));
    root.addChild(c3);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/blend-mode-multiply.png");
  });

  it("Should display a simple shader", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia } = importSkia();
    const runtimeEffect = Skia.RuntimeEffect.Make(`
    half4 main(float2 xy) {   
      return vec4(0.0, 1.0, 1.0, 1.0);
    }`)!;
    expect(runtimeEffect).toBeTruthy();
    const paint = new PaintNode({});
    const filter = new ShaderNode({
      runtimeEffect,
      uniforms: [],
    });
    paint.addShader(filter);
    const root = new GroupNode({ paint });
    const fill = new FillNode();
    root.addChild(fill);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/cyan.png");
  });

  it("Should display a nested shader", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const runtimeEffect = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rbga;
}`)!;
    expect(runtimeEffect).toBeTruthy();
    const paint = new PaintNode({});
    const imageShader = new ImageShaderNode({ image });
    const filter = new ShaderNode({
      runtimeEffect,
      uniforms: [50],
    });
    filter.addChild(imageShader);
    paint.addShader(filter);
    const root = new GroupNode({ paint });
    const fill = new FillNode();
    root.addChild(fill);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/nested-shader.png", true);
  });

  /*
        // const runtimeEffect = Skia.RuntimeEffect.Make(`

          <Fill>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader
            image={image}
            fit="cover"
            x={0}
            y={0}
            width={width}
            height={height}
          />
        </Shader>
      </Fill>*/
});
