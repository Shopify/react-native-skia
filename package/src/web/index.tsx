// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import type { ComponentProps, ComponentType, LazyExoticComponent } from "react";
import React, { useMemo, lazy, Suspense } from "react";
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import type { CanvasKit as CanvasKitType } from "canvaskit-wasm";

declare global {
  var CanvasKit: CanvasKitType;
}

export const LoadSkia = async () => {
  const CanvasKit = await CanvasKitInit();
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  global.CanvasKit = CanvasKit;
};

interface WithSkiaProps {
  fallback: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType }>;
}

export const WithSkia = ({ getComponent, fallback }: WithSkiaProps) => {
  const Inner = useMemo(
    () =>
      lazy(async () => {
        await LoadSkia();
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
