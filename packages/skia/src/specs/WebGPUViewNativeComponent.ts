import { codegenNativeComponent } from "react-native";
import type { ViewProps } from "react-native";
import type { Int32 } from "react-native/Libraries/Types/CodegenTypes";

export interface NativeProps extends ViewProps {
  contextId: Int32;
  transparent: boolean;
}

// eslint-disable-next-line import/no-default-export
export default codegenNativeComponent<NativeProps>("SkiaWebGPUView");
