declare module "@shopify/react-native-skia/lib/module/web" {
  import type { CanvasKitInitOptions } from "canvaskit-wasm";
  import type { ComponentProps, ComponentType, Suspense, FC } from "react";

  interface WithSkiaProps {
    fallback?: ComponentProps<typeof Suspense>["fallback"];
    getComponent: () => Promise<{
      default: ComponentType;
    }>;
    opts?: Parameters<typeof LoadSkiaWeb>[0];
  }

  const LoadSkiaWeb: (opts?: CanvasKitInitOptions) => Promise<void>;
  const LoadSkia: (opts?: CanvasKitInitOptions) => Promise<void>;
  const WithSkiaWeb: FC<WithSkiaProps>;
}
