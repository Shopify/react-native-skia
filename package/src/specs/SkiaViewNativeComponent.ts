import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { ViewProps } from "react-native";
import type { Int32 } from "react-native/Libraries/Types/CodegenTypes";

interface NativeProps extends ViewProps {
  contextId?: Int32;
}

// eslint-disable-next-line import/no-default-export
export default codegenNativeComponent<NativeProps>("SkiaView");
