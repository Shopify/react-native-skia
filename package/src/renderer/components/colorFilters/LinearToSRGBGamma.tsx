import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinearToSRGBGammaProps {}

const onDeclare = createDeclaration((_props, children, { Skia }) => {
  const cf = Skia.ColorFilter.MakeLinearToSRGBGamma();
  return composeColorFilter(Skia, cf, children);
});

export const LinearToSRGBGamma = (
  props: AnimatedProps<LinearToSRGBGammaProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
