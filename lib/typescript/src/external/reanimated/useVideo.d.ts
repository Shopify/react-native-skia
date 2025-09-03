import type { SharedValue } from "react-native-reanimated";
import type { SkImage } from "@shopify/react-native-skia";
type Animated<T> = SharedValue<T> | T;
interface PlaybackOptions {
    looping: Animated<boolean>;
    paused: Animated<boolean>;
    seek: Animated<number | null>;
    volume: Animated<number>;
}
export declare const currentSKImageFrames: SkImage[];
export declare const useVideo: (source: string | null, userOptions?: Partial<PlaybackOptions>) => {
    currentFrame: SharedValue<SkImage | null>;
    currentTime: SharedValue<number>;
    duration: number;
    framerate: number;
    rotation: import("@shopify/react-native-skia/src/skia").VideoRotation;
    size: {
        width: number;
        height: number;
    };
};
export {};
