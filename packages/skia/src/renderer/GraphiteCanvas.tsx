import React from "react";

import SkiaGraphiteViewNativeComponent from "../specs/SkiaGraphiteViewNativeComponent";

import type { CanvasProps } from "./Canvas";
import { useCanvasRoot } from "./Canvas";

/**
 * The declarative canvas on the Graphite view. It takes the same props and
 * exposes the same ref as {@link Canvas}, and draws the same children, but
 * the frames are produced differently:
 *
 * - the JS thread records the scene graph into a native recorder once per
 *   React commit and hands it to the view;
 * - the Reanimated UI runtime only reads the shared values into it (the one
 *   step that needs a JS runtime), it never replays anything;
 * - a dedicated native thread pool replays the recorder into a Graphite
 *   recording whenever the content changed, at most once per presented frame;
 * - the view presents the recording on the next vsync.
 *
 * Neither the JS thread nor the UI thread pays for drawing. It requires the
 * Graphite backend (the default since v3); with a Ganesh build the view
 * renders nothing. `colorSpace`, `android` and `androidWarmup` are accepted
 * for API compatibility and ignored: the Graphite view renders in sRGB and
 * uses its own backing view.
 */
export const GraphiteCanvas = ({
  debug,
  opaque,
  children,
  onSize,

  colorSpace,
  highBitDepth = false,

  androidWarmup,

  android,
  ref,
  onLayout,
  ...viewProps
}: CanvasProps) => {
  const { nativeId, viewRef, onLayoutWithSize } = useCanvasRoot({
    children,
    onSize,
    ref,
    onLayout,
  });
  return (
    <SkiaGraphiteViewNativeComponent
      ref={viewRef}
      collapsable={false}
      nativeID={`${nativeId}`}
      debug={debug}
      opaque={opaque}
      highBitDepth={highBitDepth}
      onLayout={onLayoutWithSize}
      {...viewProps}
    />
  );
};
