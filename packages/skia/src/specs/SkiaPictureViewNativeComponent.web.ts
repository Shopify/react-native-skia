import type { ViewProps } from "react-native";
import { createElement } from "react";
import type { WebGLOptions } from "canvaskit-wasm";

import { SkiaPictureView } from "../views/SkiaPictureView.web";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  nativeID: string;
  webglContextAttributes?: WebGLOptions;
}

const SkiaPictureViewNativeComponent = ({
  nativeID,
  debug,
  opaque,
  onLayout,
  webglContextAttributes,
  ...viewProps
}: NativeProps) => {
  return createElement(SkiaPictureView, {
    nativeID,
    debug,
    opaque,
    onLayout,
    webglContextAttributes,
    ...viewProps,
  });
};
// eslint-disable-next-line import/no-default-export
export default SkiaPictureViewNativeComponent;
