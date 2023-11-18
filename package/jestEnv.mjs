/* eslint-disable import/no-default-export */
// eslint-disable-next-line import/no-extraneous-dependencies
import { TestEnvironment } from "jest-environment-node";
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web/LoadSkiaWeb";

const CanvasKit = await LoadSkiaWeb();

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
