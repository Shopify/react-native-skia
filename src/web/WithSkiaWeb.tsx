import type { ComponentProps, ComponentType } from "react";
import React, { useMemo, lazy, Suspense } from "react";

import { Platform } from "../Platform";

import { LoadSkiaWeb } from "./LoadSkiaWeb";

type NonOptionalKeys<T> = {
  [k in keyof T]-?: undefined extends T[k] ? never : k;
}[keyof T];

type WithSkiaProps<TProps> = {
  fallback?: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType<TProps> }>;
  opts?: Parameters<typeof LoadSkiaWeb>[0];
} & (NonOptionalKeys<TProps> extends never
  ? {
      componentProps?: TProps;
    }
  : {
      componentProps: TProps;
    });

export const WithSkiaWeb = <TProps extends object>({
  getComponent,
  fallback,
  opts,
  componentProps,
}: WithSkiaProps<TProps>) => {
  const Inner = useMemo(
    // TODO: investigate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any =>
      lazy(async () => {
        if (Platform.OS === "web") {
          await LoadSkiaWeb(opts);
        } else {
          console.warn(
            "<WithSkiaWeb /> is only necessary on web. Consider not using on native."
          );
        }
        return getComponent();
      }),
    // We we to run this only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <Suspense fallback={fallback ?? null}>
      <Inner {...componentProps} />
    </Suspense>
  );
};
