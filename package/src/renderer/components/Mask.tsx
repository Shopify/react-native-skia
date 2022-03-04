import React, { Children } from "react";

import type { ChildrenProps } from "../processors/Paint";
import type { SkRect } from "../../skia/Rect";

import { usePaintRef, Paint } from "./Paint";
import { Defs } from "./Defs";
import { LumaColorFilter } from "./colorFilters/LumaColorFilter";
import { Group } from "./Group";

// Here we ask the user to provide the bounds of content
// We could compute it ourselve but prefer not to unless
// other similar use-cases come up
interface MaskProps extends ChildrenProps {
  mode: "luminance" | "alpha";
  bounds?: SkRect;
}

export const Mask = ({ children, mode, bounds }: MaskProps) => {
  const paint = usePaintRef();
  const [mask, ...content] = Children.toArray(children);
  return (
    <>
      <Defs>
        <Paint ref={paint}>{mode === "luminance" && <LumaColorFilter />}</Paint>
      </Defs>
      <Group rasterize={mode === "luminance" ? paint : undefined} clip={bounds}>
        {mask}
      </Group>
      <Group blendMode="srcIn">{content}</Group>
    </>
  );
};

Mask.defaultProps = {
  mode: "alpha",
};
