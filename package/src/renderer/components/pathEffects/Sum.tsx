import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";

export interface SumPathEffectProps {
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<SumPathEffectProps>((_, children) => {
  const [outer, inner] = children.filter(isPathEffect);
  return Skia.PathEffect.MakeCompose(outer, inner);
});

export const SumPathEffect = (props: AnimatedProps<SumPathEffectProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
