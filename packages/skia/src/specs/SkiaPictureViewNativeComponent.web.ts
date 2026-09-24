import type { ViewProps } from "react-native";
import { createElement } from "react";

import { SkiaPictureView } from "../views/SkiaPictureView.web";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  nativeID: string;
  androidSurfaceType?: "auto" | "SurfaceView" | "TextureView";
  androidZOrderOnTop?: boolean;
}

const SkiaPictureViewNativeComponent = ({
  nativeID,
  debug,
  opaque,
  onLayout,
  // Android-only, never reaches the DOM
  androidSurfaceType: _androidSurfaceType,
  androidZOrderOnTop: _androidZOrderOnTop,
  ...viewProps
}: NativeProps) => {
  return createElement(SkiaPictureView, {
    nativeID,
    debug,
    opaque,
    onLayout,
    ...viewProps,
  });
};
// eslint-disable-next-line import/no-default-export
export default SkiaPictureViewNativeComponent;
