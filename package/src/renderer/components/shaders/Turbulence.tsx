import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

export interface TurbulenceProps {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  tileWidth: number;
  tileHeight: number;
}

export const Turbulence = (props: AnimatedProps<TurbulenceProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { freqX, freqY, octaves, seed, tileWidth, tileHeight } =
        materialize(ctx, props);
      return Skia.Shader.MakeTurbulence(
        freqX,
        freqY,
        octaves,
        seed,
        tileWidth,
        tileHeight
      );
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};

Turbulence.defaultProps = {
  seed: 0,
  tileWidth: 0,
  tileHeight: 0,
};
