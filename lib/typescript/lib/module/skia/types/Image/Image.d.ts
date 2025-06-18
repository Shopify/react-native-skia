export let FilterMode: {};
export let MipmapMode: {};
export let ImageFormat: {};
export function isCubicSampling(sampling: any): boolean;
export namespace MitchellCubicSampling {
    let B: number;
    let C: number;
}
export namespace CatmullRomCubicSampling {
    let B_1: number;
    export { B_1 as B };
    let C_1: number;
    export { C_1 as C };
}
export namespace CubicSampling {
    let B_2: number;
    export { B_2 as B };
    let C_2: number;
    export { C_2 as C };
}
export function MakeCubic(B: any, C: any): {
    B: any;
    C: any;
};
