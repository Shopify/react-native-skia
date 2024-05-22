import { checkImage, itRunsE2eOnly } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";

describe("Videos", () => {
  itRunsE2eOnly("get video duration and framerate", async () => {
    const result = await surface.eval((Skia, ctx) => {
      const video = Skia.Video(ctx.localAssets[0]);
      return {
        duration: video.duration(),
        framerate: video.framerate(),
      };
    });
    expect(result).toEqual({ duration: 5280, framerate: 25 });
  });
  itRunsE2eOnly("get frame", async () => {
    // const { Skia } = importSkia();
    const data = await surface.eval((Sk, ctx) => {
      const video = Sk.Video(ctx.localAssets[0]);
      const img = video.nextImage();
      if (!img) {
        return null;
      }
      return Array.from(img.encodeToBytes());
    });
    expect(data).not.toBeNull();
    // const img = Skia.Image.MakeImageFromEncoded(
    //   Skia.Data.fromBytes(new Uint8Array(data!))
    // );
    // expect(img).not.toBeNull();
    // checkImage(img!, "snapshots/video/frame0.png");
  });
  itRunsE2eOnly("seek frame", async () => {
    const { Skia } = importSkia();
    const data = await surface.eval((Sk, ctx) => {
      const video = Sk.Video(ctx.localAssets[0]);
      video.seek(100);
      const img = video.nextImage();
      if (!img) {
        return null;
      }
      return Array.from(img.encodeToBytes());
    });
    expect(data).not.toBeNull();
    const img = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(new Uint8Array(data!))
    );
    expect(img).not.toBeNull();
    checkImage(img!, "snapshots/video/frame100.png");
  });
  itRunsE2eOnly("seek non existing frame returns null", async () => {
    const result = await surface.eval((Skia, ctx) => {
      const video = Skia.Video(ctx.localAssets[0]);
      video.seek(100000);
      const image = video.nextImage();
      return image === null;
    });
    expect(result).toBe(true);
  });
});
