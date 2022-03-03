import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LumaColorFilterProps {}

export const LumaColorFilter = (props: AnimatedProps<LumaColorFilterProps>) => {
  const declaration = useDeclaration(props, (_props, children) => {
    const cf = Skia.ColorFilter.MakeLumaColorFilter();
    return composeColorFilter(cf, children);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
