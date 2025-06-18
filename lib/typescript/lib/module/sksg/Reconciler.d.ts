export class SkiaSGRoot {
    constructor(Skia: any, nativeId?: number);
    Skia: any;
    container: {
        redraw(): void;
        recording: {
            commands: any;
            paintPool: never[];
            animationValues: any;
        } | undefined;
        Skia: any;
        nativeId: any;
        unmount(): void;
        unmounted: boolean | undefined;
        drawOnCanvas(canvas: any): void;
    } | {
        redraw(): void;
        recording: {
            commands: any;
            paintPool: never[];
        } | undefined;
        mapperId: any;
        Skia: any;
        nativeId: any;
        unmount(): void;
        unmounted: boolean | undefined;
        drawOnCanvas(canvas: any): void;
    } | {
        redraw(): void;
        mapperId: any;
        Skia: any;
        nativeId: any;
        unmount(): void;
        unmounted: boolean | undefined;
        drawOnCanvas(canvas: any): void;
    };
    root: any;
    get sg(): {
        type: any;
        props: {};
        children: any;
        isDeclaration: boolean;
    };
    render(element: any): void;
    drawOnCanvas(canvas: any): void;
    getPicture(): any;
    unmount(): void;
}
