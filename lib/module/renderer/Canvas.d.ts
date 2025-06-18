import type { FC } from "react";
import React from "react";
import type { ViewProps } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { SkImage, SkRect, SkSize } from "../skia/types";
export interface CanvasRef extends FC<CanvasProps> {
    makeImageSnapshot(rect?: SkRect): SkImage;
    makeImageSnapshotAsync(rect?: SkRect): Promise<SkImage>;
    redraw(): void;
    getNativeId(): number;
}
export declare const useCanvasRef: () => React.RefObject<CanvasRef>;
export interface CanvasProps extends ViewProps {
    debug?: boolean;
    opaque?: boolean;
    onSize?: SharedValue<SkSize>;
    mode?: "continuous" | "default";
}
export declare const Canvas: React.ForwardRefExoticComponent<CanvasProps & React.RefAttributes<unknown>>;
