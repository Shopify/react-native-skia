// Setup CanvasKit for use in the browser.
import type { CanvasKit } from "canvaskit-wasm";
import CanvasKitInit from "canvaskit-wasm";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const canvasKitPromise: Promise<CanvasKit> = CanvasKitInit({});

export const canvasKit: { current: CanvasKit | undefined } = {
  current: undefined,
};

const setupCanvasKit = () =>
  canvasKitPromise.then((ck: CanvasKit) => {
    console.log("CanvasKit loaded successfully.");
    canvasKit.current = ck;
  });

setupCanvasKit();
