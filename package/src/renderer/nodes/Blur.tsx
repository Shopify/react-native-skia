import { NodeType } from "../Host";
import type { SkNode } from "../Host";
import { BlurStyle } from "../../skia/MaskFilter";
import { Skia } from "../../skia";

import type { SkEnum } from "./processors";
import { enumKey } from "./processors";

export interface BlurProps {
  style: SkEnum<typeof BlurStyle>;
  sigma: number;
}

export const Blur = (props: BlurProps) => {
  return <skBlur {...props} />;
};

export const BlurNode = (props: BlurProps): SkNode<NodeType.Blur> => ({
  type: NodeType.Blur,
  props,
  draw: ({ paint }, { style, sigma }) => {
    paint.setMaskFilter(
      Skia.MaskFilter.MakeBlur(BlurStyle[enumKey(style)], sigma, false)
    );
  },
  children: [],
  memoizable: true,
});
