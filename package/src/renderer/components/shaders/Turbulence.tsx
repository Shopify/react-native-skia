import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface TurbulenceProps {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  tileWidth: number;
  tileHeight: number;
}

export const Turbulence = (props: AnimatedProps<TurbulenceProps>) => {
  const declaration = useDeclaration(
    props,
    ({ freqX, freqY, octaves, seed, tileWidth, tileHeight }) => {
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
  return <skDeclaration declaration={declaration} />;
};

Turbulence.defaultProps = {
  seed: 0,
  tileWidth: 0,
  tileHeight: 0,
};
