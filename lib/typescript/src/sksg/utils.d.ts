import type { SharedValue } from "react-native-reanimated";
export declare const isSharedValue: <T = unknown>(value: unknown) => value is SharedValue<T>;
export declare const materialize: <T extends object>(props: T) => T;
type Composer<T> = (outer: T, inner: T) => T;
export declare const composeDeclarations: <T>(filters: T[], composer: Composer<T>) => T;
export {};
