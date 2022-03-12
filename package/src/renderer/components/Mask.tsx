import type { ReactNode } from "react";
import React from "react";

import type { SkRect } from "../../skia/Rect";

import { usePaintRef, Paint } from "./Paint";
import { Defs } from "./Defs";
import { LumaColorFilter } from "./colorFilters/LumaColorFilter";
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
  const paint = usePaintRef();
  return (
    <>
      <Defs>
        <Paint ref={paint}>{mode === "luminance" && <LumaColorFilter />}</Paint>
      </Defs>
      <Group rasterize={mode === "luminance" ? paint : undefined} clip={bounds}>
        {mask}
      </Group>
      <Group blendMode="srcIn">{children}</Group>
    </>
  );
};

Mask.defaultProps = {
  mode: "alpha",
};
