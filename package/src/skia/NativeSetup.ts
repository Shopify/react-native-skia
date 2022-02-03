import { NativeModules } from "react-native";

if (global.SkiaApi == null) {
  // Initialize RN Skia
  const SkiaModule = NativeModules.RNSkia;
  if (SkiaModule == null || typeof SkiaModule.install !== "function") {
    throw new Error(
      "Native RNSkia Module cannot be found! Make sure you correctly " +
        "installed native dependencies and rebuilt your app."
    );
  }
  const result = SkiaModule.install();
  if (result !== true) {
    throw new Error(
      `Native Skia Module failed to correctly install JSI Bindings! Result: ${result}`
    );
  }
}
