const globalSetup = async () => {
  const { LoadSkiaWeb } = require("../package/src/web/LoadSkiaWeb");
  await LoadSkiaWeb();
};

// eslint-disable-next-line import/no-default-export
export default globalSetup;
