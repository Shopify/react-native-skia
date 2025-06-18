import type { ViewProps } from "react-native";
import { SkiaPictureView } from "../views/SkiaPictureView.web";
export interface NativeProps extends ViewProps {
    debug?: boolean;
    opaque?: boolean;
    nativeID: string;
}
declare const SkiaPictureViewNativeComponent: ({ nativeID, debug, opaque, onLayout, ...viewProps }: NativeProps) => import("react").CElement<import("..").SkiaPictureViewNativeProps, SkiaPictureView>;
export default SkiaPictureViewNativeComponent;
