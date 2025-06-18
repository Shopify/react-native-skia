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

  test("parse #hex without opacity", () => {
    const { Skia } = importSkia();

    const color = Skia.Color("#808080");
    expect(color[0]).toBeCloseTo(0.5);
    expect(color[1]).toBeCloseTo(0.5);
    expect(color[2]).toBeCloseTo(0.5);
  });
  test("parse #hex with opacity", () => {
    const { Skia } = importSkia();

    let color = Skia.Color("#80808080");
    expect(color[0]).toBeCloseTo(0.5);
    expect(color[1]).toBeCloseTo(0.5);
    expect(color[2]).toBeCloseTo(0.5);
    expect(color[3]).toBeCloseTo(0.5);

    color = Skia.Color("#ff800080");
    expect(color[0]).toBeCloseTo(1);
    expect(color[1]).toBeCloseTo(0.5);
    expect(color[2]).toBeCloseTo(0);
    expect(color[3]).toBeCloseTo(0.5);
  });
});
