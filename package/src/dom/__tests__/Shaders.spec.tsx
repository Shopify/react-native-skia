import { fitRects, rect2rect } from "../../renderer";
import {
  importSkia,
  width,
  height,
  loadImage,
} from "../../renderer/__tests__/setup";
import { FilterMode, MipmapMode, TileMode } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { FillNode, GroupNode, ShaderNode, ImageShaderNode } from "../nodes";

describe("Drawings", () => {
  it("Should display a simple shader", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia } = importSkia();
    const runtimeEffect = Skia.RuntimeEffect.Make(`
    half4 main(float2 xy) {   
      return vec4(0.0, 1.0, 1.0, 1.0);
    }`)!;
    expect(runtimeEffect).toBeTruthy();

    const root = new GroupNode();
    const filter = new ShaderNode({
      runtimeEffect,
      uniforms: [],
    });
    root.addEffect(filter);
    const fill = new FillNode();
    root.addChild(fill);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/cyan.png");
  });

  it("Should display a nested shader", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, processTransform2d } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const runtimeEffect = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rbga;
}`)!;
    expect(runtimeEffect).toBeTruthy();
    const rects = fitRects(
      "cover",
      { x: 0, y: 0, width: image.width(), height: image.height() },
      Skia.XYWHRect(0, 0, width, height)
    );
    const localMatrix = processTransform2d(rect2rect(rects.src, rects.dst));
    const imageShader = new ImageShaderNode({
      image,
      tx: TileMode.Decal,
      ty: TileMode.Decal,
      fm: FilterMode.Nearest,
      mm: MipmapMode.Nearest,
      localMatrix,
    });
    const filter = new ShaderNode({
      runtimeEffect,
      uniforms: [50],
    });
    filter.addChild(imageShader);
    const root = new GroupNode();
    root.addEffect(filter);
    const fill = new FillNode();
    root.addChild(fill);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/nested-shader.png");
  });

  it("Should have always the correct state", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, processTransform2d } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const runtimeEffect = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rbga;
}`)!;
    expect(runtimeEffect).toBeTruthy();
    const rects = fitRects(
      "cover",
      { x: 0, y: 0, width: image.width(), height: image.height() },
      Skia.XYWHRect(0, 0, width, height)
    );
    const localMatrix = processTransform2d(rect2rect(rects.src, rects.dst));
    const imageShader = new ImageShaderNode({
      image,
      tx: TileMode.Decal,
      ty: TileMode.Decal,
      fm: FilterMode.Nearest,
      mm: MipmapMode.Nearest,
      localMatrix,
    });
    const filter = new ShaderNode({
      runtimeEffect,
      uniforms: [50],
    });
    filter.addChild(imageShader);
    const root = new GroupNode();
    root.addEffect(filter);
    const fill = new FillNode();
    root.addChild(fill);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/nested-shader.png");
    filter.setProps({
      runtimeEffect,
      uniforms: [25],
    });
    root.render(ctx);
    processResult(surface, "snapshots/drawings/nested-shader2.png");
  });
});
