import type { CanvasKit, Surface } from "canvaskit-wasm";
import type { Video, ImageFactory } from "../types";
export declare const createVideo: (CanvasKit: CanvasKit, url: string) => Promise<Video>;
export declare class JsiVideo implements Video {
    private ImageFactory;
    private videoElement;
    __typename__: "Video";
    private webglBuffer;
    constructor(ImageFactory: ImageFactory, videoElement: HTMLVideoElement);
    duration(): number;
    framerate(): number;
    setSurface(surface: Surface): void;
    nextImage(): import("../types").SkImage;
    seek(time: number): void;
    rotation(): 0;
    size(): {
        width: number;
        height: number;
    };
    pause(): void;
    play(): void;
    setVolume(volume: number): void;
    dispose(): void;
}
