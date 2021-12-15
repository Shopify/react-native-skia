import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isColorFilter } from "../../../skia/ColorFilter/ColorFilter";

import { composeColorFilter } from "./Compose";

export interface LerpProps {
  t: number;
  children: ReactNode | ReactNode[];
}

export const Lerp = (props: AnimatedProps<LerpProps>) => {
  const declaration = useDeclaration(props, ({ t }, children) => {
    const [src, dst] = children.filter(isColorFilter);
    const cf = Skia.ColorFilter.MakeLerp(t, dst, src);
    return composeColorFilter(
      cf,
      children.filter((c) => c !== src && c !== dst)
    );
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
