import { itRunsE2eOnly } from "../../../__tests__/setup";
import { ColorSpace } from "../../../skia/types";
import { surface } from "../setup";

describe("P3 Color Space", () => {
  it("MakeOffscreen with DisplayP3 produces a valid surface and image", async () => {
    const result = await surface.eval(
      (Skia, ctx) => {
        const offscreen = Skia.Surface.MakeOffscreen(256, 256, {
          colorSpace: ctx.colorSpace,
        });
        if (!offscreen) {
          return null;
        }
        offscreen.flush();
        const snapshotImage = Skia.Image.MakeNull();
        offscreen.makeImageSnapshot(undefined, snapshotImage);
        return { width: snapshotImage.width(), height: snapshotImage.height() };
      },
      { colorSpace: ColorSpace.DisplayP3 }
    );
    expect(result).not.toBeNull();
    expect(result!.width).toBe(256);
    expect(result!.height).toBe(256);
  });

  itRunsE2eOnly(
    "MakeOffscreen with SRGB produces a valid surface and image",
    async () => {
      const result = await surface.eval(
        (Skia, ctx) => {
          const offscreen = Skia.Surface.MakeOffscreen(256, 256, {
            colorSpace: ctx.colorSpace,
          });
          if (!offscreen) {
            return null;
          }
          offscreen.flush();
          const snapshotImage = Skia.Image.MakeNull();
          offscreen.makeImageSnapshot(undefined, snapshotImage);
          return {
            width: snapshotImage.width(),
            height: snapshotImage.height(),
          };
        },
        { colorSpace: ColorSpace.SRGB }
      );
      expect(result).not.toBeNull();
      expect(result!.width).toBe(256);
      expect(result!.height).toBe(256);
    }
  );
});
