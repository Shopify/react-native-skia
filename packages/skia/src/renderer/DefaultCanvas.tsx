import React from "react";

import type { CanvasProps } from "./Canvas";
import { Canvas as PictureCanvas } from "./Canvas";
import { Canvas2 } from "./Canvas2";

let canvas2AsDefault = false;

/**
 * Debug flag: when enabled, `<Canvas>` renders {@link Canvas2} (the
 * declarative canvas on the Graphite view) instead of the picture view based
 * canvas. Call it once at startup, before the first canvas is rendered:
 * canvases already mounted switch implementation (and remount) on their next
 * render. On the web, `Canvas2` is the regular canvas so the flag has no effect.
 */
export const setCanvas2AsDefault = (enabled: boolean) => {
  canvas2AsDefault = enabled;
};

export const Canvas = (props: CanvasProps) => {
  return canvas2AsDefault ? (
    <Canvas2 {...props} />
  ) : (
    <PictureCanvas {...props} />
  );
};
