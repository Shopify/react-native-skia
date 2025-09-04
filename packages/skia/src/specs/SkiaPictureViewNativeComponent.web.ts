import type { ViewProps } from "react-native";
import { createElement } from "react";

import { SkiaPictureView } from "../views/SkiaPictureView.web";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  nativeID: string;
  webglContextAttributes?: {
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    preferLowPowerToHighPerformance?: boolean;
    failIfMajorPerformanceCaveat?: boolean;
    enableExtensionsByDefault?: boolean;
    explicitSwapControl?: boolean;
    renderViaOffscreenBackBuffer?: boolean;
    majorVersion?: number;
    minorVersion?: number;
  };
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
