import type { ReactNode } from "react";
import type { SkCanvas, Skia } from "../skia/types";
import { NodeType } from "../dom/types";
import "./Elements";
export declare class SkiaSGRoot {
    Skia: Skia;
    private root;
    private container;
    constructor(Skia: Skia, nativeId?: number);
    get sg(): {
        type: NodeType;
        props: {};
        children: import("./Node").Node<unknown>[];
        isDeclaration: boolean;
    };
    render(element: ReactNode): void;
    drawOnCanvas(canvas: SkCanvas): void;
    getPicture(): import("../skia/types").SkPicture;
    unmount(): void;
}
