import { crossplatformRequireNativeComponent as original } from "./require-native-component";

export const crossplatformRequireNativeComponent: typeof original = {
  requireNativeComponent: () => {
    throw new Error("requireNativeComponent is not supported on the web");
  },
};
