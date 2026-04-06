import { surface } from "../setup";

describe("Surfaces", () => {
  it("surface has width and height", async () => {
    const result = await surface.eval((Skia) => {
      using surface1 = Skia.Surface.Make(1920, 1080)!;
      using surface2 = Skia.Surface.MakeOffscreen(1920, 1080)!;
      return [
        surface1.width(),
        surface1.height(),
        surface2.width(),
        surface2.height(),
      ];
    });
    expect(result).toEqual([1920, 1080, 1920, 1080]);
  });
});
