import type { ReactNode } from "react";
import React, { useMemo } from "react";

import type { SkRect } from "../../skia/Rect";
import { BlendMode, Skia } from "../../skia";

import { Group } from "./Group";

// Here we ask the user to provide the bounds of content
// We could compute it ourselve but prefer not to unless
// other similar use-cases come up
interface MaskProps {
  mode: "luminance" | "alpha";
  bounds?: SkRect;
  mask: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
}

export const Mask = ({ children, mask, mode, bounds }: MaskProps) => {
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setBlendMode(BlendMode.Src);
    if (mode === "luminance") {
      p.setColorFilter(Skia.ColorFilter.MakeLumaColorFilter());
    }
    return p;
  }, [mode]);
  return (
    <Group layer>
      <Group layer={paint} clip={bounds}>
        {mask}
      </Group>
      <Group blendMode="srcIn">{children}</Group>
    </Group>
  );
};

Mask.defaultProps = {
  mode: "alpha",
};
