import React from "react";

import type { SkEnum } from "../../../dom/types";
import { BlurStyle } from "../../../skia/types";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { enumKey } from "../../../dom/nodes/datatypes";

export interface BlurMaskProps {
  style: SkEnum<typeof BlurStyle>;
  blur: number;
  respectCTM: boolean;
}

const onDeclare = createDeclaration<BlurMaskProps>(
  ({ style, blur, respectCTM }, _, { Skia }) => {
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
