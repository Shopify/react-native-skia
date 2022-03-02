import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { Path1DEffectStyle, isPathEffect } from "../../../skia/PathEffect";
import type { SkEnum } from "../../processors/Paint";
import { enumKey } from "../../processors/Paint";
import type { PathDef } from "../../processors/Paths";
import { processPath } from "../../processors/Paths";

export interface Path1DPathEffectProps {
  path: PathDef;
  children?: ReactNode | ReactNode[];
  advance: number;
  phase: number;
  style: SkEnum<typeof Path1DEffectStyle>;
}

export const Path1DPathEffect = (
  props: AnimatedProps<Path1DPathEffectProps>
) => {
  const declaration = useDeclaration(
    props,
    ({ path, advance, phase, style }, children) => {
      const [child] = children.filter(isPathEffect);
      const pe = Skia.PathEffect.MakePath1D(
        processPath(path),
        advance,
        phase,
        Path1DEffectStyle[enumKey(style)]
      );
      if (child) {
        if (!pe) {
          return child;
        }
        return Skia.PathEffect.MakeCompose(pe, child);
      }
      return pe;
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
