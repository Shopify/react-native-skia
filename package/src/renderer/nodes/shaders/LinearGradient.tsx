import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import type { Vector } from "../../math/Vector";
import { point } from "../../math/Vector";
import { processColor } from "../processors/Paint";

export interface LinearGradientProps {
  start: Vector;
  end: Vector;
  positions: number[];
  colors: string[];
}

export const LinearGradient = (props: LinearGradientProps) => {
  return <skLinearGradient {...props} />;
};

export const LinearGradientNode = (
  props: LinearGradientProps
): SkNode<NodeType.LinearGradient> => ({
  type: NodeType.LinearGradient,
  props,
  draw: ({ CanvasKit, paint, opacity }, { start, end, positions, colors }) => {
    paint.setShader(
      CanvasKit.Shader.MakeLinearGradient(
        point(start),
        point(end),
        colors.map((color) => processColor(color, opacity)),
        positions,
        CanvasKit.TileMode.Clamp
      )
    );
  },
  children: [],
  memoizable: true,
});
