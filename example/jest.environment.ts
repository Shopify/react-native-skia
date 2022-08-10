import type { Config } from "@jest/types";
import NodeEnvironment from "jest-environment-node";
import { LoadSkiaWeb } from "@shopify/react-native-skia/src/web/LoadSkiaWeb";
import { JsiSkApi } from "@shopify/react-native-skia/src/skia/web";

/**
 * @see https://jestjs.io/docs/configuration#testenvironment-string
 */
class SkiaTestEnvironment extends NodeEnvironment {
  constructor(config: Config.ProjectConfig) {
    super(config);
  }

  async setup() {
    await super.setup();
    await LoadSkiaWeb();
    this.global.Skia = JsiSkApi(global.CanvasKit);
  }

  async teardown() {
    await super.teardown();
  }
}

// eslint-disable-next-line import/no-default-export
export default SkiaTestEnvironment;
