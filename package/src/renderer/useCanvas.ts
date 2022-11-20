import React, { useContext } from "react";

import type { Skia } from "../skia/types";

interface CanvasContext {
  Skia: Skia;
}

const CanvasContext = React.createContext<CanvasContext | null>(null);

export const CanvasProvider = CanvasContext.Provider;

// This private function will be removed once we remove the useCanvas hook and
// implement the Mask component as a node (will be faster too)
export const useSkiaPrivate = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("Skia Canvas context is not available");
  }
  return ctx.Skia;
};
