/* eslint-disable import/no-default-export */
// eslint-disable-next-line import/no-extraneous-dependencies
import { TestEnvironment } from "jest-environment-node";
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";

export default class SkiaEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    const CanvasKit = await CanvasKitInit({});
    this.global.CanvasKit = CanvasKit;
  }

  async teardown() {}

  getVmContext() {
    return super.getVmContext();
  }
}
