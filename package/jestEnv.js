// eslint-disable-next-line import/no-extraneous-dependencies
const NodeEnvironment = require("jest-environment-node").TestEnvironment;

class SkiaEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    const {
      LoadSkiaWeb,
    } = require("@shopify/react-native-skia/lib/commonjs/web/LoadSkiaWeb");
    await LoadSkiaWeb();
  }

  async teardown() {}

  getVmContext() {
    return super.getVmContext();
  }
}

module.exports = SkiaEnvironment;
