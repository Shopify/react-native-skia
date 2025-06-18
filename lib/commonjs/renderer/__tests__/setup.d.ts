import type { ReactNode } from "react";
import type { Server, WebSocket } from "ws";
import type * as SkiaExports from "../../index";
import type { SkImage, SkFont, Skia, SkCanvas } from "../../skia/types";
import { SkiaSGRoot } from "../../sksg/Reconciler";
type TestOS = "ios" | "android" | "web" | "node";
declare global {
    var testServer: Server;
    var testClient: WebSocket;
    var testOS: TestOS;
}
export declare let surface: TestingSurface;
export declare let images: {
    oslo: SkImage;
    skiaLogoPng: SkImage;
    skiaLogoJpeg: SkImage;
    mask: SkImage;
};
export declare let fonts: {
    RobotoMedium: SkFont;
    NotoColorEmoji: SkFont;
    NotoSansSCRegular: SkFont;
    UberMoveMediumMono: SkFont;
    DinMedium: SkFont;
};
export declare const wait: (ms: number) => Promise<unknown>;
export declare const resolveFile: (uri: string) => Buffer<ArrayBufferLike>;
export declare const resolveFont: (uri: string) => number[];
export declare const testingFonts: {
    Roboto: number[][];
};
export interface EmptyProps {
}
export declare const BirdGIF: string;
export declare const loadImage: (uri: string) => SkiaExports.SkImage;
export declare const loadFont: (uri: string, ftSize?: number) => SkiaExports.SkFont;
export declare const importSkia: () => typeof SkiaExports;
export declare const PIXEL_RATIO = 3;
export declare const fontSize: number;
export declare const width: number;
export declare const height: number;
export declare const center: {
    x: number;
    y: number;
};
export declare const drawOnNode: (element: ReactNode) => SkiaExports.SkSurface;
export declare const mountCanvas: (element: ReactNode) => {
    surface: SkiaExports.SkSurface;
    root: SkiaSGRoot;
    draw: () => void;
};
export declare const serialize: (element: ReactNode) => string;
export type EvalContext = Record<string, any>;
interface TestingSurface {
    eval<Ctx extends EvalContext = EvalContext, R = any>(fn: (Skia: Skia, ctx: Ctx) => R, ctx?: Ctx): Promise<R>;
    drawOffscreen<Ctx extends EvalContext, R>(fn: (Skia: Skia, canvas: SkCanvas, ctx: Ctx) => R, ctx?: Ctx): Promise<SkImage>;
    draw(node: ReactNode): Promise<SkImage>;
    screen(name: string): Promise<SkImage>;
    width: number;
    height: number;
    fontSize: number;
    OS: TestOS;
    arch: "paper" | "fabric";
}
export {};
