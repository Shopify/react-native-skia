import type { ViewProps } from "react-native";

import type { GroupProps, RenderNode } from "../dom/types";
import type { SkImage, SkPicture, SkRect, SkSize } from "../skia/types";
import type { SharedValueType } from "../renderer/processors/Animations/Animations";

export type NativeSkiaViewProps = ViewProps & {
  debug?: boolean;
  opaque?: boolean;
};

export interface DrawingInfo {
  width: number;
  height: number;
  timestamp: number;
}

export interface ISkiaViewApi {
  setJsiProperty: <T>(nativeId: number, name: string, value: T) => void;
  requestRedraw: (nativeId: number) => void;
  makeImageSnapshot: (nativeId: number, rect?: SkRect) => SkImage;
  makeImageSnapshotAsync: (nativeId: number, rect?: SkRect) => Promise<SkImage>;
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
  onSize?: SharedValueType<SkSize>;

  opaque?: boolean;
}

export interface SkiaPictureViewNativeProps extends SkiaBaseViewProps {
  picture?: SkPicture;
}

export interface SkiaDomViewNativeProps extends SkiaBaseViewProps {
  root?: RenderNode<GroupProps>;
}
