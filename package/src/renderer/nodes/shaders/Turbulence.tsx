import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";

export interface TurbulenceProps {
  freqX: number;
  freqY: number;
  octaves: number;
  seed: number;
  tileWidth: number;
  tileHeight: number;
}

export const Turbulence = ({
  freqX,
  freqY,
  octaves,
  seed,
  tileWidth,
  tileHeight,
}: TurbulenceProps) => {
  const onDeclare = useDeclaration(() => {
    return Skia.Shader.MakeTurbulence(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
    );
  }, [freqX, freqY, octaves, seed, tileHeight, tileWidth]);
  return <skDeclaration onDeclare={onDeclare} />;
};

Turbulence.defaultProps = {
  seed: 0,
  tileWidth: 0,
  tileHeight: 0,
};
