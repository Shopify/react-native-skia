import React, { useContext } from "react";

import type { Skia } from "../skia/types";
import type { SkiaValue } from "../values/types";

interface CanvasContext {
  Skia: Skia;
  size: SkiaValue<{ width: number; height: number }>;
}

const CanvasContext = React.createContext<CanvasContext | null>(null);

export const CanvasProvider = CanvasContext.Provider;

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("Canvas context is not available");
  }
  return ctx;
};
