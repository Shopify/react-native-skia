module.exports = async () => {
  const {
    LoadSkiaWeb,
  } = require("@shopify/react-native-skia/lib/commonjs/web/LoadSkiaWeb");
  await LoadSkiaWeb();
};
