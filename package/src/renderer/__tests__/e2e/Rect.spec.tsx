import { surface } from "../setup";

describe("Rects and rounded rects", () => {
  it("The rounded rectangle radii should be scale to its maximum value", async () => {
    const result = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 200, 200);
      return { rx: rrect.rx, ry: rrect.ry };
    });
    expect(result).toEqual({ rx: 50, ry: 50 });

    const result1 = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 200, 20);
      return { rx: rrect.rx, ry: rrect.ry };
    });
    expect(result1).toEqual({ rx: 50, ry: 5 });

    const result2 = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 0, 0);
      return rrect.rx + rrect.ry;
    });
    expect(result2).toBe(0);

    const result3 = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 10, 20);
      return { rx: rrect.rx, ry: rrect.ry };
    });
    expect(result3).toEqual({ rx: 10, ry: 20 });
  });
});
