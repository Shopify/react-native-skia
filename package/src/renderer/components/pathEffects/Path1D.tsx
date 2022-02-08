import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { Path1DEffectStyle, isPathEffect } from "../../../skia/PathEffect";
import type { IPath } from "../../../skia/Path/Path";
import type { SkEnum } from "../../processors/Paint";
import { enumKey } from "../../processors/Paint";

export interface Path1DPathEffectProps {
  children?: ReactNode | ReactNode[];
  path: IPath | string;
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
        typeof path === "string" ? Skia.Path.MakeFromSVGString(path) : path,
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
