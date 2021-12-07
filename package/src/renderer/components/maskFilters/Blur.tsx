import React from "react";

import { BlurStyle } from "../../../skia/MaskFilter";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlurProps {
  style: SkEnum<typeof BlurStyle>;
  sigma: number;
}

export const Blur = (props: AnimatedProps<BlurProps>) => {
  const declaration = useDeclaration(props, ({ style, sigma }) => {
    return Skia.MaskFilter.MakeBlur(BlurStyle[enumKey(style)], sigma, false);
  });
  return <skDeclaration declaration={declaration} />;
};

Blur.defaultProps = {
  style: "normal",
};
