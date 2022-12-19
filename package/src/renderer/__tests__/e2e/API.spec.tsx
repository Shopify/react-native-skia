import { surface } from "../setup";

describe("API", () => {
  it("Should do rect marshalling properly (1)", async () => {
    const result = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 200, 200);
      return { rx: rrect.rx, ry: rrect.ry };
    });
    expect(result).toEqual({ rx: 50, ry: 50 });
  });

  it("Should do rect marshalling properly (2)", async () => {
    const result = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 0, 0);
      return rrect.rx + rrect.ry;
    });
    expect(result).toBe(0);
  });

  it("Should do rect marshalling properly (3)", async () => {
    const result = await surface.eval((Skia) => {
      const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 10, 20);
      return { rx: rrect.rx, ry: rrect.ry };
    });
    expect(result).toEqual({ rx: 10, ry: 20 });
  });
});
