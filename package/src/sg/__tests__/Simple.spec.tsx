import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { createNode } from "../Node";
import { NodeType } from "../../dom/types";
import { renderNode } from "../Renderer";
import { setupSkia } from "../../skia/__tests__/setup";

describe("Simple", () => {
  it("Fill", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia } = importSkia();
    const root = createNode(NodeType.Fill, { color: "red" });
    const ctx = {
      Skia,
      canvas,
      paints: [Skia.Paint()],
    };
    renderNode(ctx, root);
    processResult(surface, "snapshots/demos/simple1.png");
  });
});
