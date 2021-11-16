import { RNSkiaView } from "./views";
import { Api } from "./skia";
export * from "./hooks";
export { RNSkiaView };

export const Skia = {
  View: RNSkiaView,
  ...Api,
};

export * from "./skia";
