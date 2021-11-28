import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";

export interface ColorMatrixProps {
  value: number[];
}

export const ColorMatrix = ({ value }: ColorMatrixProps) => {
  const onDeclare = useDeclaration(() => {
    return Skia.ColorFilter.MakeMatrix(value);
  }, [value]);
  return <skDeclaration onDeclare={onDeclare} />;
};

export const OpacityMatrix = (opacity: number) => [
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  opacity,
  0,
];
