import React from "react";

import type { SkottieProps } from "../../dom/types";
import type { SkiaProps } from "../processors";

export const Skottie = (props: SkiaProps<SkottieProps>) => {
  return <skSkottie {...props} />;
};
