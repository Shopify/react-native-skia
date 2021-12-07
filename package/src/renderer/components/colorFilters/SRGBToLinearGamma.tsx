import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SRGBToLinearGammaProps {}

export const SRGBToLinearGamma = (
  props: AnimatedProps<SRGBToLinearGammaProps>
) => {
  const declaration = useDeclaration(props, (_props, children) => {
    const cf = Skia.ColorFilter.MakeSRGBToLinearGamma();
    return composeColorFilter(cf, children);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
