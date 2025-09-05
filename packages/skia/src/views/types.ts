import type { ViewProps } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { WebGLOptions } from "canvaskit-wasm";

import type { Node } from "../dom/types";
import type { SkImage, SkPicture, SkRect, SkSize } from "../skia/types";

export type NativeSkiaViewProps = ViewProps & {
  debug?: boolean;
  opaque?: boolean;
};

export interface ISkiaViewApi {
  web?: boolean;
  setJsiProperty: <T>(nativeId: number, name: string, value: T) => void;
  requestRedraw: (nativeId: number) => void;
  makeImageSnapshot: (nativeId: number, rect?: SkRect) => SkImage;
  makeImageSnapshotAsync: (nativeId: number, rect?: SkRect) => Promise<SkImage>;
  size: (nativeId: number) => SkSize;
}

export interface SkiaBaseViewProps extends ViewProps {
  /**
   * When set to true the view will display information about the
   * average time it takes to render.
   */
  debug?: boolean;
  /**
   * Pass an animated value to the onSize property to get updates when
   * the Skia view is resized.
   */
  onSize?: SharedValue<SkSize>;

  opaque?: boolean;

  /**
   * WebGL context attributes for web platform.
   * Allows configuration of the WebGL rendering context.
   * Only applicable when running on web platform.
   * Uses CanvasKit's WebGLOptions type directly - all values must be numeric (0 or 1 for boolean flags).
   */
  webglContextAttributes?: WebGLOptions;
}

export interface SkiaPictureViewNativeProps extends SkiaBaseViewProps {
  picture?: SkPicture;
}

export interface SkiaDomViewNativeProps extends SkiaBaseViewProps {
  root?: Node<unknown>;
}
