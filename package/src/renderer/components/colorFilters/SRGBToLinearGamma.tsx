import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isColorFilter } from "../../../skia/ColorFilter/ColorFilter";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SRGBToLinearGammaProps {}

export const SRGBToLinearGamma = (
  props: AnimatedProps<SRGBToLinearGammaProps>
) => {
  const declaration = useDeclaration(props, (_props, children) => {
    const [child] = children.filter(isColorFilter);
    const cf = Skia.ColorFilter.MakeSRGBToLinearGamma();
    if (child) {
      return Skia.ColorFilter.MakeCompose(cf, child);
    }
    return cf;
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
