import { importSkia, surface } from "../setup";

describe("Matrix", () => {
  it("should reset a matrix", async () => {
    const { Skia: CanvasKit } = importSkia();
    const result = await surface.eval((Skia) => {
      const matrix = Skia.Matrix();
      matrix.scale(2, 2);
      matrix.reset();
      return matrix.get();
    });
    expect(result).toEqual(CanvasKit.Matrix().get());
  });
  it("should set a Matrix from values", async () => {
    const { Skia: CanvasKit } = importSkia();
    const result = await surface.eval((Skia) => {
      const matrix = Skia.Matrix();
      matrix.scale(2, 2);
      matrix.translate(100, 100);
      matrix.setAll(1, 2, 3, 4, 5, 6, 7, 8, 9);
      return matrix.get();
    });
    const reference = CanvasKit.Matrix();
    reference.setAll(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(result).toEqual(reference.get());
  });
  it("should set a Matrix from another Matrix", async () => {
    const { Skia: CanvasKit } = importSkia();
    const result = await surface.eval((Skia) => {
      const matrix = Skia.Matrix();
      matrix.scale(2, 2);
      matrix.translate(100, 100);
      const m2 = Skia.Matrix();
      m2.scale(2, 2);
      m2.translate(100, 100);
      m2.setAll(1, 2, 3, 4, 5, 6, 7, 8, 9);
      matrix.swap(m2);
      return matrix.get();
    });
    const reference = CanvasKit.Matrix();
    reference.setAll(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(result).toEqual(reference.get());
  });
});
