import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SRGBToLinearGammaProps {}

const onDeclare = createDeclaration((_props, children, { Skia }) => {
  const cf = Skia.ColorFilter.MakeSRGBToLinearGamma();
  return composeColorFilter(Skia, cf, children);
});

export const SRGBToLinearGamma = (
  props: AnimatedProps<SRGBToLinearGammaProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
