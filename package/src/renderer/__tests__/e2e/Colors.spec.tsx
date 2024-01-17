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
  it("should render the same color regardless of constructor input types", async () => {
    // given (different inputs representing the same color
    const colors = [
      { kind: "string" as const, value: "red" },
      { kind: "float32Array" as const, value: [1, 0, 0, 1] },
      { kind: "number" as const, value: 0xffff0000 },
      { kind: "array" as const, value: [1, 0, 0, 1] },
    ];

    // when (for each input we draw a colored canvas and encode it to bytes)
    const buffers = await Promise.all(
      colors.map((color) =>
        surface
          .drawOffscreen(
            (Skia, canvas, ctx) => {
              const c =
                ctx.color.kind === "float32Array"
                  ? // we cannot pass in a Float32Array via ctx, need to construct it inside
                    new Float32Array(ctx.color.value)
                  : ctx.color.value;
              canvas.drawColor(Skia.Color(c));
            },
            { color }
          )
          .then((image) => image.encodeToBytes())
      )
    );

    // then (expect the encoded bytes are equal)
    for (let i = 1; i < buffers.length; i++) {
      const prev = buffers[i - 1];
      const curr = buffers[i];
      expect(prev.length).toBe(curr.length);
      for (let j = 0; j < prev.length; j++) {
        expect(prev[j]).toBe(curr[j]);
      }
    }
  });
});
