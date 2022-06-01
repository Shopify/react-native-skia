import {
  Mask,
  DrawingNode,
  useContextBridge,
  DependencyManager,
  useCanvas,
} from "../index";

describe("Renderer", () => {
  it("Loads renderer without Skia", () => {
    expect(Mask).toBeDefined();
    expect(DrawingNode).toBeDefined();
    expect(useContextBridge).toBeDefined();
    expect(DependencyManager).toBeDefined();
    expect(useCanvas).toBeDefined();
  });
});
