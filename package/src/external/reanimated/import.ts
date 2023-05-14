export let Reanimated2: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let Reanimated3: any;
export let reanimatedVersion: string;

try {
  Reanimated2 = require("react-native-reanimated");
  reanimatedVersion =
    // eslint-disable-next-line import/extensions
    require("react-native-reanimated/package.json").version;
  if (
    reanimatedVersion &&
    (reanimatedVersion >= "3.0.0" || reanimatedVersion.includes("3.0.0-"))
  ) {
    Reanimated3 = Reanimated2;
  }
} catch (e) {}
