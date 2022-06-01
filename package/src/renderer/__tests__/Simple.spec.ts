import { Mask } from "../components";
import { DrawingNode } from "../nodes";
import { useContextBridge } from "../useContextBridge";
import { DependencyManager } from "../DependencyManager";
import { useCanvas } from "../useCanvas";

describe("Renderer", () => {
  it("Loads renderer without Skia", () => {
    expect(Mask).toBeDefined();
    expect(DrawingNode).toBeDefined();
    expect(useContextBridge).toBeDefined();
    expect(DependencyManager).toBeDefined();
    expect(useCanvas).toBeDefined();
  });
});
