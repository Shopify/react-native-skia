import type { CanvasKit } from "canvaskit-wasm";

import { LoadSkiaWeb } from "../LoadSkiaWeb";

describe("LoadSkiaWeb CanvasKit compatibility", () => {
  const originalCanvasKit = global.CanvasKit;

  afterEach(() => {
    global.CanvasKit = originalCanvasKit;
  });

  it.each([
    { _rnskiaImageEncodingOptions: true, _rnskiaImageEncodingVersion: 0 },
    { _rnskiaImageEncodingOptions: false, _rnskiaImageEncodingVersion: 1 },
    { _rnskiaImageEncodingOptions: true },
  ])("rejects an incompatible preloaded JS/WASM pair", async (canvasKit) => {
    global.CanvasKit = canvasKit as unknown as CanvasKit;

    await expect(LoadSkiaWeb()).rejects.toThrow("incompatible");
  });

  it("accepts the matching encoding ABI", async () => {
    global.CanvasKit = {
      _rnskiaImageEncodingOptions: true,
      _rnskiaImageEncodingVersion: 1,
    } as unknown as CanvasKit;

    await expect(LoadSkiaWeb()).resolves.toBeUndefined();
  });
});
