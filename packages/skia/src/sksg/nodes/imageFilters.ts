"worklet";

import { enumKey } from "../../dom/nodes";
import type { BlurMaskFilterProps } from "../../dom/types";
import { BlurStyle } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

export const declareBlurMaskFilter = (
  ctx: DrawingContext,
  props: BlurMaskFilterProps
) => {
  const { style, blur, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.declCtx.maskFilters.push(mf);
};
