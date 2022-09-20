import type { ReactNode, ComponentType } from "react";
import React, { useMemo, lazy, Suspense } from "react";
import { Platform } from "react-native";

import { LoadSkiaWeb } from "./LoadSkiaWeb";

interface WithSkiaProps {
  fallback?: ReactNode;
  getComponent: () => Promise<{ default: ComponentType<unknown> }>;
  opts?: Parameters<typeof LoadSkiaWeb>[0];
}

export const WithSkiaWeb = ({
  getComponent,
  fallback,
  opts,
}: WithSkiaProps) => {
  const Inner = useMemo(
    () =>
      lazy(async () => {
        if (Platform.OS === "web") {
          await LoadSkiaWeb(opts);
        } else {
          console.warn(
            "<WithSkiaWeb /> is only necessary on web. Consider not using on native."
          );
        }
        return getComponent();
      }) as ComponentType<unknown>,
    [getComponent, opts]
  );
  return (
    <Suspense fallback={fallback ?? null}>
      <Inner />
    </Suspense>
  );
};
