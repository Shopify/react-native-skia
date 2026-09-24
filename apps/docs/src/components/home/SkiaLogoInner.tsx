"use client";

import { RedrawCanvas, RedrawProvider } from "react-redraw";

import { library, render } from "./skia-logo";

export function SkiaLogoInner() {
  return (
    <RedrawProvider errorFallback={null}>
      <RedrawCanvas
        style={{ width: "100%", height: "100%" }}
        library={library}
        render={render}
      />
    </RedrawProvider>
  );
}
