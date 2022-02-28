import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { getInput } from "./getInput";

export interface OffsetProps {
  x: number;
  y: number;
  children?: ReactNode | ReactNode[];
}

export const Offset = (props: AnimatedProps<OffsetProps>) => {
  const declaration = useDeclaration(props, ({ x, y }, children) => {
    return Skia.ImageFilter.MakeOffset(x, y, getInput(children));
  });
  return <skDeclaration declaration={declaration} {...props} />;
};

Offset.defaultProps = {
  x: 0,
  y: 0,
};
