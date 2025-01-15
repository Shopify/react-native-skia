export let HAS_REANIMATED_3 = false;

try {
  // This logic is convoluted but necessary
  // In most systems, `require("react-native-reanimated")` throws an error, all is well.
  // In webpack, in some configuration it will return an empty object.
  // So it will not throw an error and we need to check the version to know if it's there.
  const reanimatedVersion =
    require("react-native-reanimated/package.json").version;
  require("react-native-reanimated");
  if (
    reanimatedVersion &&
    (reanimatedVersion >= "3.0.0" || reanimatedVersion.includes("3.0.0-"))
  ) {
    HAS_REANIMATED_3 = true;
  }
} catch (e) {
  // do nothing
}
