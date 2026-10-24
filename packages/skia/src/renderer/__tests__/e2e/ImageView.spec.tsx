import type { SkImage } from "../../../skia/types";
import { itRunsE2eOnly } from "../../../__tests__/setup";
import {
  loseGpuDevice,
  readMiddleLuminance,
  readScreenColor,
  readScreenHalves,
  surface,
} from "../setup";

const expectEvenGreyMiddle = (image: SkImage) => {
  const { mean, deviation } = readMiddleLuminance(image);
  expect(deviation).toBeLessThan(30);
  expect(mean).toBeGreaterThan(60);
  expect(mean).toBeLessThan(200);
};

describe("SkiaImageView", () => {
  itRunsE2eOnly(
    "fills its box with a GPU image and with a CPU image",
    async () => {
      const image = await surface.screen("ImageView");
      expect(readScreenHalves(image)).toEqual({ top: "cyan", bottom: "red" });
    }
  );

  // The pixels were read back into a platform bitmap: a GPU image's view
  // keeps them once the device that drew the image is gone.
  itRunsE2eOnly("keeps both images through a GPU device loss", async () => {
    await surface.screen("ImageView");
    expect(await loseGpuDevice()).toEqual([]);
    const image = await surface.screen("ImageView");
    expect(readScreenHalves(image)).toEqual({ top: "cyan", bottom: "red" });
  });

  itRunsE2eOnly(
    "fills its box with a CPU image wider than the largest texture",
    async () => {
      const image = await surface.screen("ImageViewWide");
      expect(readScreenColor(image, 1 / 2)).toBe("red");
    }
  );

  // A React Native view's props round it and clip it, on Android as on iOS.
  // Its corners show the background in whatever colour the platform draws it:
  // Android's force dark darkens the white
  // (https://developer.android.com/develop/ui/views/theming/darktheme#force-dark).
  itRunsE2eOnly("clips its image to its rounded corners", async () => {
    const image = await surface.screen("ImageViewRounded");
    const { top, bottom: background } = readScreenHalves(image);
    expect(top).toBe("cyan");
    expect(background).not.toBe("cyan");
    expect(readScreenColor(image, 1 / 100)).toBe(background);
  });

  // Each image is a bitmap larger than Android draws in one piece.
  itRunsE2eOnly("fills its box with images past a bitmap's limit", async () => {
    const image = await surface.screen("ImageViewOversized");
    expect(readScreenHalves(image)).toEqual({ top: "cyan", bottom: "red" });
  });

  // One-pixel stripes drawn several times smaller read as an even grey:
  // Android draws a smaller level of the bitmap, averaged as mipmaps are,
  // where sampling the full-size bitmap aliases them into bands of black and
  // white; iOS draws them averaged as it stands.
  itRunsE2eOnly("smooths an image it draws smaller than it is", async () => {
    expectEvenGreyMiddle(await surface.screen("ImageViewMinified"));
  });

  // Each level of an image with odd sides has odd sides: a level scaled by
  // (n / 2) / n rather than a half samples the middle of a side on pixel
  // centres, where the stripes read black or white.
  itRunsE2eOnly(
    "smooths an image with odd sides it draws smaller than it is",
    async () => {
      expectEvenGreyMiddle(await surface.screen("ImageViewMinifiedOdd"));
    }
  );
});
