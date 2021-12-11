import React from "react";
import type { ReactNode } from "react";

import { useDeclaration } from "../nodes";

export interface DefsProps {
  children: ReactNode | ReactNode[];
}

export const Defs = (props: DefsProps) => {
  const declaration = useDeclaration(props, () => {
    // Do nothing.
    // The goal of this component is to avoid declared paint from
    // being used in the drawing context automatically
    return null;
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
