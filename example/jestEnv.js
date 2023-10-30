// eslint-disable-next-line import/no-extraneous-dependencies
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";

const LoadSkiaWeb = async (opts) => {
  if (global.CanvasKit !== undefined) {
    return;
  }
  const CanvasKit = await CanvasKitInit(opts);
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  return CanvasKit;
};

// eslint-disable-next-line import/no-extraneous-dependencies
const NodeEnvironment = require("jest-environment-node").TestEnvironment;

class SkiaEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    this.global.CanvasKit = await LoadSkiaWeb();
  }

  async teardown() {}

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = SkiaEnvironment;
