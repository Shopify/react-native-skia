import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { BlendMode, BlurStyle } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { GroupNode, FillNode, CircleNode, BlurMaskFilterNode } from "../nodes";

describe("Drawings", () => {
  it("Hello World", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec, polar2Canvas } = importSkia();
    const c = vec(width / 2, height / 2);
    const c1 = Skia.Color("#61bea2");
    const c2 = Skia.Color("#529ca0");
    const R = width / 4;
    const color = Skia.Color("rgb(36,43,56)");
    const root = new GroupNode({ paint: { color } });
    root.addChild(new FillNode());

    const rings = new GroupNode({ paint: { blendMode: BlendMode.Screen } });
    rings.addEffect(
      new BlurMaskFilterNode({
        sigma: 10,
        style: BlurStyle.Solid,
        respectCTM: true,
      })
    );
    for (let i = 0; i < 6; i++) {
      const theta = (i * (2 * Math.PI)) / 6;
      const matrix = Skia.Matrix();
      const { x, y } = polar2Canvas({ theta, radius: R }, { x: 0, y: 0 });
      matrix.translate(x, y);
      const ring = new GroupNode({ matrix, paint: { color: i % 2 ? c1 : c2 } });
      ring.addChild(new CircleNode({ c, r: R }));
      rings.addChild(ring);
    }
    root.addChild(rings);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/demos/breathe.png");
  });
});
