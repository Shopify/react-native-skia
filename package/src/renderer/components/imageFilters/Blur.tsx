import React from "react";
import type { ReactNode } from "react";

import { TileMode } from "../../../skia";
import type { Radius, SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { processRadius } from "../../processors/Radius";
import { createDeclaration } from "../../nodes";

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
