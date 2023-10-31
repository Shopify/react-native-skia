/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import { TestEnvironment } from "jest-environment-node";

const CanvasKit = await CanvasKitInit({});

export default class SkiaEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    this.global.CanvasKit = CanvasKit;
  }

  async teardown() {}

  getVmContext() {
    return super.getVmContext();
  }
}
