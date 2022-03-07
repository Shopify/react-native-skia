import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { getInput } from "./getInput";

export interface OffsetProps {
  x: number;
  y: number;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<OffsetProps>(({ x, y }, children) => {
  return Skia.ImageFilter.MakeOffset(x, y, getInput(children));
});

export const Offset = (props: AnimatedProps<OffsetProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Offset.defaultProps = {
  x: 0,
  y: 0,
};
