import { importSkia } from "../../renderer/__tests__/setup";

describe("Geometry", () => {
  it("should calculate the bounding box the union of multiple rectangles", () => {
    const { bounds, rect } = importSkia();

    const r1 = rect(-10, -10, 30, 30);
    const r2 = rect(30, 30, 100, 20);
    const result = bounds([r1, r2]);
    expect(result.x).toBe(-10);
    expect(result.y).toBe(-10);
    expect(result.width).toBe(140);
    expect(result.height).toBe(60);
  });
});
