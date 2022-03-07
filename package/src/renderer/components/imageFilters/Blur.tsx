import React from "react";
import type { ReactNode } from "react";

import { Skia, TileMode } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
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

export const Blur = (props: AnimatedProps<BlurProps>) => {
  const onDeclare = useDeclaration(
    props,
    ({ sigmaX, sigmaY, mode }, children) => {
      return Skia.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        TileMode[enumKey(mode)],
        getInput(children)
      );
    }
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Blur.defaultProps = {
  mode: "decal",
};
