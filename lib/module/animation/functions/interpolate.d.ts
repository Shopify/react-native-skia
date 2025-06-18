export declare enum Extrapolate {
    IDENTITY = "identity",
    CLAMP = "clamp",
    EXTEND = "extend"
}
export interface ExtrapolationConfig {
    extrapolateLeft?: Extrapolate | string;
    extrapolateRight?: Extrapolate | string;
}
interface RequiredExtrapolationConfig {
    extrapolateLeft: Extrapolate;
    extrapolateRight: Extrapolate;
}
export type ExtrapolationType = ExtrapolationConfig | Extrapolate | string | undefined;
export declare function validateInterpolationOptions(type: ExtrapolationType): RequiredExtrapolationConfig;
export declare function interpolate(x: number, input: readonly number[], output: readonly number[], type?: ExtrapolationType): number;
export {};
