import React from "react";

import { Blur } from "../imageFilters";
import type { AnimatedProps } from "../../processors";

import type { BackdropFilterProps } from "./BackdropFilter";
import { BackdropFilter } from "./BackdropFilter";

interface BackdropBlurProps extends Omit<BackdropFilterProps, "filter"> {
  blur: number;
}

export const BackdropBlur = ({
  blur,
  children,
  ...props
}: AnimatedProps<BackdropBlurProps>) => {
  return (
    <BackdropFilter filter={<Blur sigmaX={blur} sigmaY={blur} />} {...props}>
      {children}
    </BackdropFilter>
  );
};
