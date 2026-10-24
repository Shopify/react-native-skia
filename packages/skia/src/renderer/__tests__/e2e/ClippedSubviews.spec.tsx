import { itRunsE2eOnly } from "../../../__tests__/setup";
import type { SkImage } from "../../../skia/types";
import { readScreenColor, surface } from "../setup";

// The ClippedSubviews screens put a canvas, a picture view and a graphite view
// side by side, each taller than the screen.
const readViews = (image: SkImage) => ({
  canvas: readScreenColor(image, 1 / 6),
  pictureView: readScreenColor(image, 1 / 2),
  graphiteView: readScreenColor(image, 5 / 6),
});

describe("A Skia view a scroll view takes out of the window", () => {
  itRunsE2eOnly("draws again once scrolled back", async () => {
    const image = await surface.screen("ClippedSubviewsBack");
    expect(readViews(image)).toEqual({
      canvas: "red",
      pictureView: "cyan",
      graphiteView: "cyan",
    });
  });

  itRunsE2eOnly("draws again each time it is scrolled back", async () => {
    const image = await surface.screen("ClippedSubviewsTwice");
    expect(readViews(image)).toEqual({
      canvas: "red",
      pictureView: "cyan",
      graphiteView: "cyan",
    });
  });

  itRunsE2eOnly("draws what React changed while it was away", async () => {
    const image = await surface.screen("ClippedSubviewsStateChanged");
    expect(readViews(image)).toEqual({
      canvas: "cyan",
      pictureView: "cyan",
      graphiteView: "cyan",
    });
  });

  itRunsE2eOnly("draws the shared values set while it was away", async () => {
    const image = await surface.screen("ClippedSubviewsSharedValueChanged");
    expect(readViews(image)).toEqual({
      canvas: "cyan",
      pictureView: "cyan",
      graphiteView: "cyan",
    });
  });

  // A graphite view shows nothing on the new device until its JS records
  // again, as one in the window does, so only the other two are read.
  itRunsE2eOnly(
    "draws on the GPU device that replaced the one lost while it was away",
    async () => {
      const { canvas, pictureView } = readViews(
        await surface.screen("ClippedSubviewsDeviceLost")
      );
      expect({ canvas, pictureView }).toEqual({
        canvas: "red",
        pictureView: "cyan",
      });
    }
  );
});

// The ClippedStatic screens put a static canvas on the left and an image view
// on the right. A static canvas keeps its native view and its frame while it
// is away.
const readStaticSides = (image: SkImage) => ({
  staticCanvas: readScreenColor(image, 1 / 4),
  imageView: readScreenColor(image, 3 / 4),
});

describe("A static canvas a scroll view takes out of the window", () => {
  itRunsE2eOnly("shows its frame again once scrolled back", async () => {
    const image = await surface.screen("ClippedStaticBack");
    expect(readStaticSides(image)).toEqual({
      staticCanvas: "red",
      imageView: "cyan",
    });
  });

  itRunsE2eOnly(
    "shows its frame again each time it is scrolled back",
    async () => {
      const image = await surface.screen("ClippedStaticTwice");
      expect(readStaticSides(image)).toEqual({
        staticCanvas: "red",
        imageView: "cyan",
      });
    }
  );

  itRunsE2eOnly("shows what React changed while it was away", async () => {
    const image = await surface.screen("ClippedStaticStateChanged");
    expect(readStaticSides(image)).toEqual({
      staticCanvas: "cyan",
      imageView: "cyan",
    });
  });

  itRunsE2eOnly("shows the shared values set while it was away", async () => {
    const image = await surface.screen("ClippedStaticSharedValueChanged");
    expect(readStaticSides(image)).toEqual({
      staticCanvas: "cyan",
      imageView: "cyan",
    });
  });
});
