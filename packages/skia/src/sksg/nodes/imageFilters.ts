import { enumKey } from "../../dom/nodes";
import type { BlurMaskFilterProps } from "../../dom/types";
import { BlurStyle } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";
import type { Node } from "../Node";

export const declareBlurMaskFilter = (
  ctx: DrawingContext,
  node: Node<BlurMaskFilterProps>
) => {
  "worklet";
  const { style, blur, respectCTM } = node.props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.declCtx.maskFilters.push(mf);
};
