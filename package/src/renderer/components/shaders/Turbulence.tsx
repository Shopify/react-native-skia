import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface TurbulenceProps {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  tileWidth: number;
  tileHeight: number;
}

const onDeclare = createDeclaration<TurbulenceProps>(
  ({ freqX, freqY, octaves, seed, tileWidth, tileHeight }, _, { Skia }) => {
    return Skia.Shader.MakeTurbulence(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
    );
  }
);

export const Turbulence = (props: AnimatedProps<TurbulenceProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Turbulence.defaultProps = {
  seed: 0,
  tileWidth: 0,
  tileHeight: 0,
};
