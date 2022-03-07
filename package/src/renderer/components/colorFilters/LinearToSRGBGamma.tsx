import React from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinearToSRGBGammaProps {}

const onDeclare = createDeclaration((_props, children) => {
  const cf = Skia.ColorFilter.MakeLinearToSRGBGamma();
  return composeColorFilter(cf, children);
});

export const LinearToSRGBGamma = (
  props: AnimatedProps<LinearToSRGBGammaProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
