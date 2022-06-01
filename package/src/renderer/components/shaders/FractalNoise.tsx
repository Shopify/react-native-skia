import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface FractalNoiseProps {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  tileWidth: number;
  tileHeight: number;
}

const onDeclare = createDeclaration<FractalNoiseProps>(
  ({ freqX, freqY, octaves, seed, tileWidth, tileHeight }, _, { Skia }) => {
    return Skia.Shader.MakeFractalNoise(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
    );
  }
);

export const FractalNoise = (props: AnimatedProps<FractalNoiseProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

FractalNoise.defaultProps = {
  seed: 0,
  tileWidth: 0,
  tileHeight: 0,
};
