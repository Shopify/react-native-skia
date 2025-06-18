import type { ComponentProps, ComponentType } from "react";
import React, { Suspense } from "react";
import { LoadSkiaWeb } from "./LoadSkiaWeb";
type NonOptionalKeys<T> = {
    [k in keyof T]-?: undefined extends T[k] ? never : k;
}[keyof T];
type WithSkiaProps<TProps> = {
    fallback?: ComponentProps<typeof Suspense>["fallback"];
    getComponent: () => Promise<{
        default: ComponentType<TProps>;
    }>;
    opts?: Parameters<typeof LoadSkiaWeb>[0];
} & (NonOptionalKeys<TProps> extends never ? {
    componentProps?: TProps;
} : {
    componentProps: TProps;
});
export declare const WithSkiaWeb: <TProps extends object>({ getComponent, fallback, opts, componentProps, }: WithSkiaProps<TProps>) => React.JSX.Element;
export {};
