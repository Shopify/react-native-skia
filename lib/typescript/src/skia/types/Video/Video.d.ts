import type { SkImage } from "../Image";
import type { SkJSIInstance } from "../JsiInstance";
export type VideoRotation = 0 | 90 | 180 | 270;
export interface Video extends SkJSIInstance<"Video"> {
    duration(): number;
    framerate(): number;
    nextImage(): SkImage | null;
    seek(time: number): void;
    rotation(): VideoRotation;
    size(): {
        width: number;
        height: number;
    };
    pause(): void;
    play(): void;
    setVolume(volume: number): void;
}
