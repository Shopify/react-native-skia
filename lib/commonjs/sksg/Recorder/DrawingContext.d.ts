import type { Skia, SkCanvas, SkColorFilter, SkPaint, SkShader, SkImageFilter, SkPathEffect } from "../../skia/types";
export declare const createDrawingContext: (Skia: Skia, paintPool: SkPaint[], canvas: SkCanvas) => {
    Skia: Skia;
    canvas: SkCanvas;
    paints: SkPaint[];
    colorFilters: SkColorFilter[];
    shaders: SkShader[];
    imageFilters: SkImageFilter[];
    pathEffects: SkPathEffect[];
    paintDeclarations: SkPaint[];
    paintPool: SkPaint[];
    savePaint: () => void;
    saveBackdropFilter: () => void;
    readonly paint: SkPaint;
    restorePaint: () => SkPaint | undefined;
    materializePaint: () => void;
};
export type DrawingContext = ReturnType<typeof createDrawingContext>;
