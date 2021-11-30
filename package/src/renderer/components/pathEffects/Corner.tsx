import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface CornerPathEffectProps {
  r: number;
  children?: ReactNode | ReactNode[];
}

export const CornerPathEffect = (
  props: AnimatedProps<CornerPathEffectProps>
) => {
  const declaration = useDeclaration(props, ({ r }) => {
    return Skia.PathEffect.MakeCorner(r);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
