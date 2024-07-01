import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import type { SGNode } from "../Node";
import { createNode } from "../Node";
import { NodeType } from "../../dom/types";
import { renderNode } from "../Renderer";
import { setupSkia } from "../../skia/__tests__/setup";

describe("Breathe", () => {
  it("Apple Breathe Demo", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec, polar2Canvas } = importSkia();
    const c = vec(width / 2, height / 2);
    const c1 = Skia.Color("#61bea2");
    const c2 = Skia.Color("#529ca0");
    const R = width / 4;
    const color = Skia.Color("rgb(36,43,56)");
    const fill = createNode(NodeType.Fill, {});

    const blur = createNode(NodeType.BlurMaskFilter, {
      blur: 10,
      style: "solid",
      respectCTM: true,
    });

    const ringChildren: SGNode[] = [];
    for (let i = 0; i < 6; i++) {
      const theta = (i * (2 * Math.PI)) / 6;
      const matrix = Skia.Matrix();
      const { x, y } = polar2Canvas({ theta, radius: R }, { x: 0, y: 0 });
      matrix.translate(x, y);
      const ring = createNode(
        NodeType.Group,
        {
          matrix,
          color: i % 2 ? c1 : c2,
        },
        [createNode(NodeType.Circle, { c, r: R })]
      );
      ringChildren.push(ring);
    }
    const rings = createNode(NodeType.Group, { blendMode: "screen" }, [
      blur,
      ...ringChildren,
    ]);
    const root = createNode(
      NodeType.Group,
      {
        color,
      },
      [fill, rings]
    );
    const ctx = {
      Skia,
      canvas,
      paints: [Skia.Paint()],
    };
    renderNode(ctx, root);
    processResult(surface, "snapshots/demos/breathe.png");
  });
  // it("1Demo", () => {

  // });
  // it("Apple Breathe Demo with the new API", () => {
  //   const { surface, canvas } = setupSkia(width, height);
  //   const { Skia, vec, polar2Canvas } = importSkia();
  //   const Sk = getSkDOM();
  //   const c = vec(width / 2, height / 2);
  //   const c1 = Skia.Color("#61bea2");
  //   const c2 = Skia.Color("#529ca0");
  //   const R = width / 4;
  //   const color = Skia.Color("rgb(36,43,56)");
  //   const root = Sk.Group({ color });
  //   root.addChild(Sk.Fill());
  //   const rings = Sk.Group({
  //     blendMode: "screen",
  //   });
  //   const blur = Sk.BlurMaskFilter({
  //     blur: 10,
  //     style: "solid",
  //     respectCTM: true,
  //   });
  //   rings.addChild(blur);
  //   for (let i = 0; i < 6; i++) {
  //     const theta = (i * (2 * Math.PI)) / 6;
  //     const matrix = Skia.Matrix();
  //     const { x, y } = polar2Canvas({ theta, radius: R }, { x: 0, y: 0 });
  //     matrix.translate(x, y);
  //     rings.addChild(Sk.Circle({ c, r: R, matrix, color: i % 2 ? c1 : c2 }));
  //   }
  //   root.addChild(rings);
  //   const ctx = new JsiDrawingContext(Skia, canvas);
  //   root.render(ctx);
  //   processResult(surface, "snapshots/demos/breathe.png");
  // });
  // it("Apple Breathe Demo with animations", () => {
  //   const { surface, canvas } = setupSkia(width, height);
  //   const { Skia, vec, polar2Canvas } = importSkia();
  //   const Sk = getSkDOM();
  //   const c = vec(width / 2, height / 2);
  //   const c1 = Skia.Color("#61bea2");
  //   const c2 = Skia.Color("#529ca0");
  //   const R = width / 4;
  //   const color = Skia.Color("rgb(36,43,56)");
  //   const root = Sk.Group({ color });
  //   root.addChild(Sk.Fill());
  //   const rings = Sk.Group({
  //     blendMode: "screen",
  //   });
  //   const blur = Sk.BlurMaskFilter({
  //     blur: 10,
  //     style: "solid",
  //     respectCTM: true,
  //   });
  //   rings.addChild(blur);
  //   for (let i = 0; i < 6; i++) {
  //     const theta = (i * (2 * Math.PI)) / 6;
  //     const matrix = Skia.Matrix();
  //     const { x, y } = polar2Canvas({ theta, radius: R }, { x: 0, y: 0 });
  //     matrix.translate(x, y);
  //     rings.addChild(Sk.Circle({ c, r: R, matrix, color: i % 2 ? c1 : c2 }));
  //   }
  //   root.addChild(rings);
  //   const ctx = new JsiDrawingContext(Skia, canvas);
  //   root.render(ctx);
  //   processResult(surface, "snapshots/demos/breathe.png");
  //   blur.setProp("blur", 0);
  //   root.setProp("transform", [
  //     { translateX: c.x },
  //     { translateY: c.y },
  //     { rotate: Math.PI / 4 },
  //     { translateX: -c.x },
  //     { translateY: -c.y },
  //   ]);
  //   for (let i = 0; i < 6; i++) {
  //     const theta = (i * (2 * Math.PI)) / 6;
  //     const matrix = Skia.Matrix();
  //     const scale = 0.5;
  //     const { x, y } = polar2Canvas({ theta, radius: 0.5 * R }, { x: 0, y: 0 });
  //     matrix.translate(x, y);
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const ring = rings.children()[i + 1] as any;
  //     ring.setProp("matrix", undefined);
  //     ring.setProp("transform", [
  //       { translateX: c.x },
  //       { translateY: c.y },
  //       { translateX: x },
  //       { translateY: y },
  //       { scale },
  //       { translateX: -c.x },
  //       { translateY: -c.y },
  //     ]);
  //   }
  //   root.render(ctx);
  //   processResult(surface, "snapshots/demos/breathe2.png");
  // });
});
