import React from "react";

import { Blur } from "../imageFilters";
import type { AnimatedProps } from "../../processors";

import type { BackdropFilterProps } from "./BackdropFilter";
import { BackdropFilter } from "./BackdropFilter";

interface BackdropBlurProps extends BackdropFilterProps {
  blur: number;
}

export const BackdropBlur = ({
  blur,
  children,
  ...props
}: AnimatedProps<BackdropBlurProps>) => {
  return (
    <BackdropFilter {...props}>
      <Blur sigmaX={blur} sigmaY={blur} />
      {children}
    </BackdropFilter>
  );
};
