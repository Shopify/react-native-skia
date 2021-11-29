import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface FractalNoiseProps {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  tileWidth: number;
  tileHeight: number;
}

export const FractalNoise = (props: AnimatedProps<FractalNoiseProps>) => {
  const declaration = useDeclaration(
    props,
    ({ freqX, freqY, octaves, seed, tileWidth, tileHeight }) => {
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
  return <skDeclaration declaration={declaration} />;
};

FractalNoise.defaultProps = {
  seed: 0,
  tileWidth: 0,
  tileHeight: 0,
};
