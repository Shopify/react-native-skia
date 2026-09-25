import type { ViewProps } from "react-native";
import { createElement } from "react";

import { SkiaGraphiteView } from "../views/SkiaGraphiteView.web";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  highBitDepth?: boolean;
  nativeID: string;
}

const SkiaGraphiteViewNativeComponent = ({
  nativeID,
  debug,
  opaque,
  highBitDepth,
  onLayout,
  ...viewProps
}: NativeProps) => {
  return createElement(SkiaGraphiteView, {
    nativeID,
    debug,
    opaque,
    highBitDepth,
    onLayout,
    ...viewProps,
  });
};
// eslint-disable-next-line import/no-default-export
export default SkiaGraphiteViewNativeComponent;
