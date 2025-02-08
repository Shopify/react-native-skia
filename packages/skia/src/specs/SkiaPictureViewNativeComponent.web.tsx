import type { ViewProps } from "react-native";
import { useEffect, useRef } from "react";

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
  return (
    <SkiaPictureView
      ref={ref}
      debug={debug}
      opaque={opaque}
      onLayout={onLayout}
      {...viewProps}
    />
  );
};
// eslint-disable-next-line import/no-default-export
export default SkiaPictureViewNativeComponent;
