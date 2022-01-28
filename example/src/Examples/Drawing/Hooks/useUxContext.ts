import { useContext } from "react";

import type { UxContextType } from "../Context";

import { UxContext } from "./useUxProvider";

export const useUxContext = (): UxContextType => {
  const context = useContext(UxContext);
  if (context === null) {
    throw Error("Ux Context missing");
  }
  return context!;
};
