import "../NativeSetup.web";
import type { CanvasKit } from "canvaskit-wasm";
import CanvasKitInit from "canvaskit-wasm";

beforeAll((cb) => {
  CanvasKitInit().then((CanvasKit: CanvasKit) => {
    global.CanvasKit = CanvasKit;
    cb();
  });
});

describe("NativeSetup", () => {
  it("Check that CanvasKit is loaded", () => {
    expect(global.CanvasKit).toBeDefined();
  });
});
