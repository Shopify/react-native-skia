/* eslint-disable jest/no-disabled-tests */
import type { Video } from "../../../skia/types";
import { surface } from "../setup";

// TODO: to reanable these tests we need to run them on the UI thread
describe("Videos", () => {
  it.skip("get video duration and framerate", async () => {
    const result = await surface.eval((Skia, ctx) => {
      const video = Skia.Video(ctx.localAssets[0]) as Video;
      return {
        duration: video.duration(),
        framerate: video.framerate(),
        width: video.size().width,
        height: video.size().height,
      };
    });
    expect(result).toEqual({
      duration: 5280,
      framerate: 25,
      height: 720,
      width: 1280,
    });
  });
  // TODO: We need to reanable these tests once we can run them on the UI thread
  // itRunsE2eOnly("get frame", async () => {
  //   const { Skia } = importSkia();
  //   const data = await surface.eval((Sk, ctx) => {
  //     const video = Sk.Video(ctx.localAssets[0]);
  //     const img = video.nextImage();
  //     if (!img) {
  //       return null;
  //     }
  //     return Array.from(img.encodeToBytes());
  //   });
  //   expect(data).not.toBeNull();
  //   const img = Skia.Image.MakeImageFromEncoded(
  //     Skia.Data.fromBytes(new Uint8Array(data!))
  //   );
  //   expect(img).not.toBeNull();
  //   checkImage(img!, "snapshots/video/frame0.png");
  // });
  // itRunsE2eOnly("seek frame", async () => {
  //   const { Skia } = importSkia();
  //   const data = await surface.eval((Sk, ctx) => {
  //     const video = Sk.Video(ctx.localAssets[0]);
  //     video.seek(100);
  //     const img = video.nextImage();
  //     if (!img) {
  //       return null;
  //     }
  //     return Array.from(img.encodeToBytes());
  //   });
  //   expect(data).not.toBeNull();
  //   const img = Skia.Image.MakeImageFromEncoded(
  //     Skia.Data.fromBytes(new Uint8Array(data!))
  //   );
  //   expect(img).not.toBeNull();
  //   checkImage(img!, "snapshots/video/frame100.png");
  // });
  it.skip("seek non existing frame returns null", async () => {
    const result = await surface.eval((Skia, ctx) => {
      const video = Skia.Video(ctx.localAssets[0]) as Video;
      video.seek(100000);
      const image = video.nextImage();
      return image === null;
    });
    expect(result).toBe(true);
  });
});
