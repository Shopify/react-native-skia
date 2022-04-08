import React from "react";

import { BlurStyle } from "../../../skia/MaskFilter";
import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlurMaskProps {
  style: SkEnum<typeof BlurStyle>;
  blur: number;
  respectCTM: boolean;
}

const onDeclare = createDeclaration<BlurMaskProps>(
  ({ style, blur, respectCTM }) => {
    return Skia.MaskFilter.MakeBlur(
      BlurStyle[enumKey(style)],
      blur,
      respectCTM
    );
  }
);

export const BlurMask = (props: AnimatedProps<BlurMaskProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

BlurMask.defaultProps = {
  style: "normal",
  respectCTM: true,
};
