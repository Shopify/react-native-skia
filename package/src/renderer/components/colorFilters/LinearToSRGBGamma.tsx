import React from "react";

import { Skia, isColorFilter } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinearToSRGBGammaProps {}

export const LinearToSRGBGamma = (
  props: AnimatedProps<LinearToSRGBGammaProps>
) => {
  const declaration = useDeclaration(props, (_props, children) => {
    const [child] = children.filter(isColorFilter);
    const cf = Skia.ColorFilter.MakeLinearToSRGBGamma();
    if (child) {
      return Skia.ColorFilter.MakeCompose(cf, child);
    }
    return cf;
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
