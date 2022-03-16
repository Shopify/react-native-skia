import React from "react";
import type { ReactNode } from "react";

import { Skia, TileMode } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { Radius, SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { processRadius } from "../../processors/Radius";

import { getInput } from "./getInput";

export interface BlurProps {
  blur: Radius;
  mode: SkEnum<typeof TileMode>;
  children?: ReactNode | ReactNode[];
}

export const Blur = (props: AnimatedProps<BlurProps>) => {
  const declaration = useDeclaration(props, ({ blur, mode }, children) => {
    const sigma = processRadius(blur);
    return Skia.ImageFilter.MakeBlur(
      sigma.x,
      sigma.y,
      TileMode[enumKey(mode)],
      getInput(children)
    );
  });
  return <skDeclaration declaration={declaration} {...props} />;
};

Blur.defaultProps = {
  mode: "decal",
};
