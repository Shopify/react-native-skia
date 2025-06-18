export const __esModule: boolean;
export function createVideo(CanvasKit: any, url: any): Promise<any>;
export class JsiVideo {
    constructor(ImageFactory: any, videoElement: any);
    ImageFactory: any;
    videoElement: any;
    duration(): number;
    framerate(): jest.Mock<any, any, any>;
    setSurface(surface: any): void;
    webglBuffer: _CanvasKitWebGLBufferImpl.CanvasKitWebGLBufferImpl | undefined;
    nextImage(): any;
    seek(time: any): void;
    rotation(): number;
    size(): {
        width: any;
        height: any;
    };
    pause(): void;
    play(): void;
    setVolume(volume: any): void;
    dispose(): void;
}
import _CanvasKitWebGLBufferImpl = require("./CanvasKitWebGLBufferImpl");
