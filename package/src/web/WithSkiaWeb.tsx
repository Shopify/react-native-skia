import type { ComponentProps, ComponentType } from "react";
import React, { useMemo, lazy, Suspense } from "react";

import { LoadSkiaWeb } from "./LoadSkiaWeb";

const isWeb = !!globalThis.document;

interface WithSkiaProps {
  fallback?: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType }>;
  opts?: Parameters<typeof LoadSkiaWeb>[0];
}

export const WithSkiaWeb = ({
  getComponent,
  fallback,
  opts,
}: WithSkiaProps) => {
  const Inner = useMemo(
    // TODO: investigate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any =>
      lazy(async () => {
        if (isWeb) {
          await LoadSkiaWeb(opts);
        } else {
          console.warn(
            "<WithSkiaWeb /> is only necessary on web. Consider not using on native."
          );
        }
        return getComponent();
      }),
    [getComponent, opts]
  );
  return (
    <Suspense fallback={fallback ?? null}>
      <Inner />
    </Suspense>
  );
};
