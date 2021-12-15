import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinearToSRGBGammaProps {}

export const LinearToSRGBGamma = (
  props: AnimatedProps<LinearToSRGBGammaProps>
) => {
  const declaration = useDeclaration(props, (_props, children) => {
    const cf = Skia.ColorFilter.MakeLinearToSRGBGamma();
    return composeColorFilter(cf, children);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
