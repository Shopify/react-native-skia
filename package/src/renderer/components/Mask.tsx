import type { ReactNode } from "react";
import React, { useMemo } from "react";

// TODO: remove
import { Skia } from "../../skia/Skia";
import { BlendMode } from "../../skia/types";

import { Group } from "./Group";

interface MaskProps {
  mode: "luminance" | "alpha";
  clip: boolean;
  mask: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
}

export const Mask = ({ children, mask, mode, clip }: MaskProps) => {
  const maskPaint = useMemo(() => {
    const paint = Skia.Paint();
    paint.setBlendMode(BlendMode.Src);
    if (mode === "luminance") {
      paint.setColorFilter(Skia.ColorFilter.MakeLumaColorFilter());
    }
    return paint;
  }, [mode]);
  const clippingPaint = useMemo(() => {
    const paint = Skia.Paint();
    paint.setBlendMode(BlendMode.DstIn);
    return paint;
  }, []);
  return (
    <Group layer>
      <Group layer={maskPaint}>
        {mask}
        {clip && <Group layer={clippingPaint}>{children}</Group>}
      </Group>
      <Group blendMode="srcIn">{children}</Group>
    </Group>
  );
};

Mask.defaultProps = {
  mode: "alpha",
  clip: true,
};
