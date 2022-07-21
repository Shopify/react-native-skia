import type { ComponentProps, ComponentType } from "react";
import React, { useMemo, lazy, Suspense } from "react";
import { Platform } from "react-native";

import { LoadSkiaWeb } from "./LoadSkiaWeb";

interface WithSkiaProps {
  fallback: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType }>;
}

export const WithSkiaWeb = ({ getComponent, fallback }: WithSkiaProps) => {
  const Inner = useMemo(
    () =>
      lazy(async () => {
        if (Platform.OS === "web") {
          await LoadSkiaWeb();
        } else {
          console.warn(
            "<WithSkiaWeb /> is only necessary on web. Consider not using on native."
          );
        }
        return getComponent();
      }),
    [getComponent]
  );
  return (
    <Suspense fallback={fallback}>
      <Inner />
    </Suspense>
  );
};
