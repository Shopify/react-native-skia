import type { ReactNode } from "react";
import React, { useMemo } from "react";

import { BlendMode, defaultSkiaPaint } from "../../skia/types";
import { useCanvas } from "../useCanvas";

import { Group } from "./Group";

interface MaskProps {
  mode: "luminance" | "alpha";
  clip: boolean;
  mask: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
}

export const Mask = ({ children, mask, mode, clip }: MaskProps) => {
  const { Skia } = useCanvas();
  const maskPaint = useMemo(() => {
    const paint = defaultSkiaPaint(Skia.Paint());
    paint.setBlendMode(BlendMode.Src);
    if (mode === "luminance") {
      paint.setColorFilter(Skia.ColorFilter.MakeLumaColorFilter());
    }
    return paint;
  }, [Skia, mode]);
  const clippingPaint = useMemo(() => {
    const paint = defaultSkiaPaint(Skia.Paint());
    paint.setBlendMode(BlendMode.DstIn);
    return paint;
  }, [Skia]);
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
