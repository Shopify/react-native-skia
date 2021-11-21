import type { BlurStyleEnumValues } from "canvaskit-wasm";

import { NodeType } from "../Host";
import type { SkNode } from "../Host";

import type { SkEnum } from "./processors";
import { enumKey } from "./processors";

export interface BlurProps {
  style: SkEnum<BlurStyleEnumValues>;
  sigma: number;
}

export const Blur = (props: BlurProps) => {
  return <skBlur {...props} />;
};

export const BlurNode = (props: BlurProps): SkNode<NodeType.Blur> => ({
  type: NodeType.Blur,
  props,
  draw: ({ CanvasKit, paint }, { style, sigma }) => {
    paint.setMaskFilter(
      CanvasKit.MaskFilter.MakeBlur(
        CanvasKit.BlurStyle[enumKey(style)],
        sigma,
        false
      )
    );
  },
  children: [],
  memoizable: true,
});
