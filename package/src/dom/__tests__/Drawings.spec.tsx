import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { BlendMode } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { CircleNode, GroupNode } from "../nodes";

describe("Drawings", () => {
  it("Hello World", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec } = importSkia();
    const r = width * 0.33;
    // Root
    const root = new GroupNode({ paint: { blendMode: BlendMode.Multiply } });
    // C1
    const c1 = new GroupNode({ paint: { color: Skia.Color("cyan") } });
    c1.addChild(new CircleNode({ c: vec(r, r), r }));
    root.addChild(c1);
    // C2
    const c2 = new GroupNode({ paint: { color: Skia.Color("magenta") } });
    c2.addChild(new CircleNode({ c: vec(width - r, r), r }));
    root.addChild(c2);
    // C3
    const c3 = new GroupNode({ paint: { color: Skia.Color("yellow") } });
    c3.addChild(new CircleNode({ c: vec(width / 2, height - r), r }));
    root.addChild(c3);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/drawings/blend-mode-multiply.png");
  });
});
