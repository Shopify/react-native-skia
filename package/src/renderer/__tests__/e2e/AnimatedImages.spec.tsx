import { surface } from "../setup";

describe("Animated Images", () => {
  it("should decode gifs (1)", async () => {
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
  it("should decode gifs (2)", async () => {
    const result = await surface.eval((Skia) => {
      const data = Skia.Data.fromBase64(
        "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      );
      const animatedImage =
        Skia.AnimatedImage.MakeAnimatedImageFromEncoded(data);
      if (!animatedImage) {
        return "";
      }
      return animatedImage.getCurrentFrame()!.encodeToBase64();
    });
    expect(result).toEqual(
      // eslint-disable-next-line max-len
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAANzQklUCAgI2+FP4AAAAAxJREFUCJljSFwlDwACmgErMAA+hwAAAABJRU5ErkJggg=="
    );
  });
});
