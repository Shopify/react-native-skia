import { surface } from "../setup";

describe("Colors", () => {
  it("should support int, string, array, and Float32Array", async () => {
    const result = await surface.eval((Skia) => {
      const areEqualFloat32Arrays = (...arrays: Float32Array[]) => {
        // Check if all arrays have the same length
        const allSameLength = arrays.every(
          (array) => array.length === arrays[0].length
        );
        if (!allSameLength) {
          return false;
        }

        // Compare elements across all arrays for each index
        for (let i = 0; i < arrays[0].length; i++) {
          if (!arrays.every((array) => array[i] === arrays[0][i])) {
            return false;
          }
        }

        return true;
      };

      const c1 = Skia.Color("cyan");
      const c2 = Skia.Color([0, 1, 1, 1]);
      const c3 = Skia.Color(0xff00ffff);
      const c4 = Skia.Color(Float32Array.of(0, 1, 1, 1));

      const r = areEqualFloat32Arrays(c1, c2, c3, c4);
      if (!r) {
        console.log({ c1, c2, c3, c4 });
      }
      return r;
    });
    expect(result).toBe(true);
  });
});
