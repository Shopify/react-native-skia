import React from "react";

import { Blur } from "../imageFilters";

import type { BaseBackdropProps } from "./Backdrop";
import { Backdrop } from "./Backdrop";

type BackdropBlurProps = BaseBackdropProps & {
  intensity: number;
};

export const BackdropBlur = ({ intensity, ...props }: BackdropBlurProps) => {
  return (
    <Backdrop {...props}>
      <Blur sigmaX={intensity} sigmaY={intensity} />
    </Backdrop>
  );
};
