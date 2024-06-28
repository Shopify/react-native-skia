export const getReanimatedStatus = () => {
  let HAS_REANIMATED = false;
  let HAS_REANIMATED_3 = false;
  try {
    require("react-native-reanimated");
    HAS_REANIMATED = true;
    const reanimatedVersion =
      require("react-native-reanimated/package.json").version;
    if (
      reanimatedVersion &&
      (reanimatedVersion >= "3.0.0" || reanimatedVersion.includes("3.0.0-"))
    ) {
      HAS_REANIMATED_3 = true;
    }
  } catch (e) {
    HAS_REANIMATED = false;
  }

  return { HAS_REANIMATED, HAS_REANIMATED_3 };
};
