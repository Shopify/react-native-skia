// `react-native` for the live examples: react-native-web plus the few APIs it
// doesn't provide but that native-only code paths import at module load.
export * from "react-native-web";

// There are no TurboModules on the web. Reanimated and Worklets look up their
// native module with `get()` and fall back to their JS implementation.
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: (name: string) => {
    throw new Error(`TurboModule ${name} is not available on the web`);
  },
};
