import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import { processColor } from "../processors";
import type { Vector } from "../../math";
import { point } from "../../math";
import { Skia, TileMode } from "../../../skia";

export interface RadialGradientProps {
  c: Vector;
  r: number;
  colors: string[];
}

export const RadialGradient = (props: RadialGradientProps) => {
  return <skRadialGradient {...props} />;
};

export const RadialGradientNode = (
  props: RadialGradientProps
): SkNode<NodeType.RadialGradient> => ({
  type: NodeType.RadialGradient,
  props,
  draw: ({ paint, opacity }, { c, r, colors }) => {
    paint.setShader(
      Skia.Shader.MakeRadialGradient(
        point(c),
        r,
        colors.map((color) => processColor(color, opacity)),
        null,
        TileMode.Clamp
      )
    );
  },
  children: [],
  memoizable: true,
});
