import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { ViewProps } from "react-native";
import type { WithDefault } from "react-native/Libraries/Types/CodegenTypes";

export interface NativeProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  colorSpace?: string;
  androidWarmup?: boolean;
  pointerEvents?: WithDefault<"auto" | "none" | "box-none" | "box-only", "auto">;
}

// eslint-disable-next-line import/no-default-export
export default codegenNativeComponent<NativeProps>("SkiaPictureView");
