import type { ViewProps } from "react-native";
import { createElement } from "react";

import { SkiaPictureView } from "../views/SkiaPictureView.web";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  nativeID: string;
}

const SkiaPictureViewNativeComponent = ({
  nativeID,
  debug,
  opaque,
  onLayout,
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
