import React from "react";
import type { ReactNode } from "react";

import { createDeclaration } from "../nodes";

export interface DefsProps {
  children: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration(() => {
  // Do nothing.
  // The goal of this component is to avoid declared paint from
  // being used in the drawing context automatically
  return null;
});

export const Defs = (props: DefsProps) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
