import type { HostComponent, ViewProps } from "react-native";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
}

// eslint-disable-next-line import/no-default-export
export default codegenNativeComponent<NativeProps>(
  "SkiaPictureView"
) as HostComponent<NativeProps>;
