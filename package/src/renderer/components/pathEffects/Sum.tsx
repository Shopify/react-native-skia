import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";

export interface SumPathEffectProps {
  children?: ReactNode | ReactNode[];
}

export const SumPathEffect = (props: AnimatedProps<SumPathEffectProps>) => {
  const declaration = useDeclaration(props, (_, children) => {
    const [outer, inner] = children.filter(isPathEffect);
    return Skia.PathEffect.MakeCompose(outer, inner);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
