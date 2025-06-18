export const __esModule: boolean;
export class Container {
    constructor(Skia: any, nativeId: any);
    Skia: any;
    nativeId: any;
    unmount(): void;
    unmounted: boolean | undefined;
    drawOnCanvas(canvas: any): void;
}
export function createContainer(Skia: any, nativeId: any): NativeReanimatedContainer | ReanimatedContainer | StaticContainer;
declare class NativeReanimatedContainer extends Container {
    redraw(): void;
    mapperId: any;
}
declare class ReanimatedContainer extends Container {
    redraw(): void;
    recording: {
        commands: any;
        paintPool: never[];
    } | undefined;
    mapperId: any;
}
declare class StaticContainer extends Container {
    redraw(): void;
    recording: {
        commands: any;
        paintPool: never[];
        animationValues: any;
    } | undefined;
}
export {};
