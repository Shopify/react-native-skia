import type { SkColor, SkHostRect, SkPoint, SkRSXform } from "../../skia/types";
type Modifier<T> = (input: T, index: number) => void;
export declare const useRectBuffer: (size: number, modifier: Modifier<SkHostRect>) => import("react-native-reanimated/lib/typescript/commonTypes").Mutable<SkHostRect[]>;
export declare const useRSXformBuffer: (size: number, modifier: Modifier<SkRSXform>) => import("react-native-reanimated/lib/typescript/commonTypes").Mutable<SkRSXform[]>;
export declare const usePointBuffer: (size: number, modifier: Modifier<SkPoint>) => import("react-native-reanimated/lib/typescript/commonTypes").Mutable<SkPoint[]>;
export declare const useColorBuffer: (size: number, modifier: Modifier<SkColor>) => import("react-native-reanimated/lib/typescript/commonTypes").Mutable<SkColor[]>;
export {};
