import React from "react";
import type { ReactNode } from "react";

import { TileMode } from "../../../skia/types";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { createDeclaration } from "../../nodes";
import type { Radius, SkEnum } from "../../../dom/types";
import { enumKey, processRadius } from "../../../dom/nodes/datatypes";

import { getInput } from "./getInput";

export interface BlurProps {
  blur: Radius;
  mode: SkEnum<typeof TileMode>;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<BlurProps>(
  ({ blur, mode }, children, { Skia }) => {
    const sigma = processRadius(Skia, blur);
    return Skia.ImageFilter.MakeBlur(
      sigma.x,
      sigma.y,
      TileMode[enumKey(mode)],
      getInput(Skia, children)
    );
  }
);

export const Blur = (props: AnimatedProps<BlurProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Blur.defaultProps = {
  mode: "decal",
};
