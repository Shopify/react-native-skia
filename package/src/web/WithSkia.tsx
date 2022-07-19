import type { ComponentProps, ComponentType } from "react";
import React, { useMemo, lazy, Suspense } from "react";
import { Platform } from "react-native";

import { LoadSkia } from "./LoadSkia";

interface WithSkiaProps {
  fallback: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType }>;
}

export const WithSkia = ({ getComponent, fallback }: WithSkiaProps) => {
  const Inner = useMemo(
    () =>
      lazy(async () => {
        if (Platform.OS === "web") {
          await LoadSkia();
        } else {
          console.warn(
            "<WithSkia /> is only necessary on web. Consider not using on native."
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
