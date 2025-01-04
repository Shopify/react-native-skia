import { enumKey } from "../../../dom/nodes";
import type { BlurMaskFilterProps } from "../../../dom/types";
import { BlurStyle } from "../../../skia/types";
import type { DrawingContext } from "../DrawingContext";

export const setBlurMaskFilter = (
  ctx: DrawingContext,
  props: BlurMaskFilterProps
) => {
  "worklet";
  const { blur, style, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.paint.setMaskFilter(mf);
};
