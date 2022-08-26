import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { BlendMode } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { CircleNode, GroupNode, PaintNode } from "../nodes";

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
});
