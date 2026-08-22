import { setupSkia } from "./setup";

describe("SkMatrix", () => {
  it("scales uniformly when y is omitted", () => {
    const { Skia } = setupSkia();
    const matrix = Skia.Matrix();
    matrix.scale(2);
    expect(matrix.get()).toStrictEqual([2, 0, 0, 0, 2, 0, 0, 0, 1]);
  });

  it("postScales uniformly when y is omitted", () => {
    const { Skia } = setupSkia();
    const matrix = Skia.Matrix();
    matrix.postScale(2);
    expect(matrix.get()).toStrictEqual([2, 0, 0, 0, 2, 0, 0, 0, 1]);
  });

  it("keeps the two axes independent when y is given", () => {
    const { Skia } = setupSkia();
    const matrix = Skia.Matrix();
    matrix.scale(2, 3);
    expect(matrix.get()).toStrictEqual([2, 0, 0, 0, 3, 0, 0, 0, 1]);
  });
});
