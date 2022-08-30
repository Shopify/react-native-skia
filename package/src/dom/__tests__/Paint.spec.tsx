import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { docPath, processResult } from "../../__tests__/setup";
import { CircleNode, GroupNode } from "../nodes";

describe("Paint", () => {
  it("should assign a paint directly", () => {
    const size = width;
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec } = importSkia();
    const r = size / 2;

    const root = new GroupNode();

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const circle = new CircleNode({ c: vec(r, r), r, paint });
    root.addChild(circle);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("paint/assignement.png"));
  });
});
