import { Platform } from "../Platform";
import NativeSkiaModule from "../specs/NativeSkiaModule";

import { registerSkiaWorkletSerialization } from "./SkiaWorkletSerialization";

if (Platform.OS !== "web" && global.SkiaApi == null) {
  // Initialize RN Skia
  const SkiaModule = NativeSkiaModule;
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
  // Skia objects use the JSI NativeState pattern and need a custom
  // serializer to be transferable to worklet runtimes (Reanimated).
  registerSkiaWorkletSerialization();
  // No GPU (no Vulkan 1.1 on Android, for instance): the module is installed
  // and the app runs, but every canvas stays blank and the GPU APIs throw.
  // Said once here, with the reason, rather than left to the first blank
  // screen. See Skia.gpu. (globalThis: `global.SkiaApi` is narrowed to null
  // by the check above, install() having set it behind the compiler's back.)
  const { gpu } = globalThis.SkiaApi;
  if (!gpu.isAvailable) {
    console.error(`[react-native-skia] ${gpu.error}`);
  }
}
