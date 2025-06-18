import type { ViewProps } from "react-native";
import { createElement, useEffect, useRef } from "react";

import { SkiaPictureView } from "../views/SkiaPictureView.web";

import type { ISkiaViewApiWeb } from "./NativeSkiaModule.web";

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
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      (global.SkiaViewApi as ISkiaViewApiWeb).registerView(
        nativeID,
        ref.current
      );
    }
  }, [nativeID]);
  return createElement(SkiaPictureView, {
    ref,
    debug,
    opaque,
    onLayout,
    ...viewProps,
  });
};
// eslint-disable-next-line import/no-default-export
export default SkiaPictureViewNativeComponent;
