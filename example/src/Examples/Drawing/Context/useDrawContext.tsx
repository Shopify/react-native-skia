import { useContext } from "react";

import type { DrawContextType } from "./types";
import { DrawContext } from "./useDrawProvider";

export const useDrawContext = (): DrawContextType => {
  const context = useContext(DrawContext);
  if (context === null) {
    throw Error("Ux Context missing");
  }
  return context!;
};
