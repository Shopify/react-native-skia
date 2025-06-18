import type { ViewProps } from "react-native";
export interface NativeProps extends ViewProps {
    debug?: boolean;
    opaque?: boolean;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
