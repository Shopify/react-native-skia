import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import { Skia } from "../../../skia";

export interface ColorMatrixProps {
  values: number[];
}

export const ColorMatrix = (props: ColorMatrixProps) => {
  return <skColorMatrix {...props} />;
};

export const ColorMatrixNode = (
  props: ColorMatrixProps
): SkNode<NodeType.ColorMatrix> => ({
  type: NodeType.ColorMatrix,
  props,
  draw: ({ paint }, { values }) => {
    paint.setColorFilter(Skia.ColorFilter.MakeMatrix(values));
  },
  children: [],
  memoizable: true,
});

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
