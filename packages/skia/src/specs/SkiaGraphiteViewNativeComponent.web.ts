import type { ViewProps } from "react-native";
import { createElement } from "react";

import { Platform } from "../Platform";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  highBitDepth?: boolean;
  nativeID: string;
}

// Graphite is a native backend: on the web the view is an empty container.
const SkiaGraphiteViewNativeComponent = ({
  debug: _debug,
  opaque: _opaque,
  highBitDepth: _highBitDepth,
  ...viewProps
}: NativeProps) => {
  return createElement(Platform.View, viewProps);
};
// eslint-disable-next-line import/no-default-export
export default SkiaGraphiteViewNativeComponent;
