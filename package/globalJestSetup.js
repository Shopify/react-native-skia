const globalSetup = async () => {
  const {
    LoadSkiaWeb,
  } = require("@shopify/react-native-skia/lib/commonjs/web/LoadSkiaWeb");
  await LoadSkiaWeb();
};

// eslint-disable-next-line import/no-default-export
export default globalSetup;
