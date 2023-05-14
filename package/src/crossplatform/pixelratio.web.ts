import type { crossplatformPixelRatio as original } from "./pixelratio";

export const crossplatformPixelRatio: typeof original = {
  // same as react-native-web:
  // https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/Dimensions/index.js#LL76C10-L76C10
  get: () => window.devicePixelRatio,
};
