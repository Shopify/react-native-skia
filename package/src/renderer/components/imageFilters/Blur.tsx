import React from "react";
import type { ReactNode } from "react";

import { Skia, TileMode } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { getInput } from "./getInput";

export interface BlurProps {
  sigmaX: number;
  sigmaY: number;
  mode: SkEnum<typeof TileMode>;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<BlurProps>(
  ({ sigmaX, sigmaY, mode }, children) => {
    return Skia.ImageFilter.MakeBlur(
      sigmaX,
      sigmaY,
      TileMode[enumKey(mode)],
      getInput(children)
    );
  }
);

export const Blur = (props: AnimatedProps<BlurProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Blur.defaultProps = {
  mode: "decal",
};
