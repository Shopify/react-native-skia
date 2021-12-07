import React from "react";

import { BlurStyle } from "../../../skia/MaskFilter";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlurMaskProps {
  style: SkEnum<typeof BlurStyle>;
  sigma: number;
  respectCTM: boolean;
}

export const BlurMask = (props: AnimatedProps<BlurMaskProps>) => {
  const declaration = useDeclaration(props, ({ style, sigma, respectCTM }) => {
    return Skia.MaskFilter.MakeBlur(
      BlurStyle[enumKey(style)],
      sigma,
      respectCTM
    );
  });
  return <skDeclaration declaration={declaration} />;
};

BlurMask.defaultProps = {
  style: "normal",
  respectCTM: false,
};
