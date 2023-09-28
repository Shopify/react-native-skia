import { surface } from "../setup";

describe("Animated Images", () => {
  it("should decode gifs", async () => {
    const result = await surface.eval((Skia) => {
      const data = Skia.Data.fromBase64(
        "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      );
      const animatedImage =
        Skia.AnimatedImage.MakeAnimatedImageFromEncoded(data);
      if (!animatedImage) {
        return false;
      }
      animatedImage.decodeNextFrame();
      animatedImage.getCurrentFrame();
      animatedImage.currentFrameDuration();
      return true;
    });
    expect(result).toEqual(true);
  });
});
