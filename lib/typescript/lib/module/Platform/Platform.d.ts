export namespace Platform {
    export let OS: "ios" | "android" | "windows" | "macos" | "web";
    export let PixelRatio: number;
    export function resolveAsset(source: any): any;
    export { findNodeHandle };
    export { View };
}
import { findNodeHandle } from "react-native";
import { View } from "react-native";
