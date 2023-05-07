// TODO: Sync with types in package/src/animation/functions/interpolate.ts
export enum Extrapolate {
  IDENTITY = "identity",
  CLAMP = "clamp",
  EXTEND = "extend",
}

export interface ExtrapolationConfig {
  extrapolateLeft?: Extrapolate | string;
  extrapolateRight?: Extrapolate | string;
}

export type ExtrapolationType =
  | ExtrapolationConfig
  | Extrapolate
  | string
  | undefined;
