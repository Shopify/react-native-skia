import { itRunsE2eOnly } from "../../../__tests__/setup";
import { surface } from "../setup";

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
});
