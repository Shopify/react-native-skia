export function createDrawingContext(Skia: any, paintPool: any, canvas: any): {
    Skia: any;
    canvas: any;
    paints: any[];
    colorFilters: any[];
    shaders: any[];
    imageFilters: any[];
    pathEffects: any[];
    paintDeclarations: any[];
    paintPool: any;
    savePaint: () => void;
    saveBackdropFilter: () => void;
    readonly paint: any;
    restorePaint: () => any;
    materializePaint: () => void;
};
