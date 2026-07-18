// Note- This can be removed entirely once users adopt adding our jestEnv to their jest configs.
// This is left for compatibility with the older versions of skia but is not needed anymore.
import CanvasKitInit from "./dist/canvaskit/canvaskit.js";
global.CanvasKit = await CanvasKitInit({});

/* eslint-disable-next-line import/extensions */
import "./jestSetup.js";
