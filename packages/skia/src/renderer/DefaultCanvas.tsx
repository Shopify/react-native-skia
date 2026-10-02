import React from "react";

import { Skia } from "../skia";
import { Platform } from "../Platform";

import type { CanvasProps } from "./Canvas";
import { Canvas as PictureCanvas } from "./Canvas";
import { GraphiteCanvas } from "./GraphiteCanvas";

let useGraphite: boolean | null = null;

// Whether this build runs the Graphite backend. Resolved on the first render
// (the native API is installed by then) and cached: getNativeDevice() throws
// on Ganesh builds. On the web, GraphiteCanvas is the regular canvas anyway.
const hasGraphite = () => {
  if (useGraphite === null) {
    if (Platform.OS === "web") {
      useGraphite = false;
    } else {
      try {
        useGraphite = typeof Skia.getNativeDevice() === "bigint";
      } catch {
        useGraphite = false;
      }
    }
  }
  return useGraphite;
};

/**
 * `<Canvas>` renders {@link GraphiteCanvas} when React Native Skia is
 * configured with the Graphite backend (the default since v3), and the
 * picture view based canvas otherwise. Both take the same props and ref.
 */
export const Canvas = (props: CanvasProps) => {
  return hasGraphite() ? (
    <GraphiteCanvas {...props} />
  ) : (
    <PictureCanvas {...props} />
  );
};
