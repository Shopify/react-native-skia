import React, { Children } from "react";

import type { ChildrenProps } from "../processors/Paint";

import { usePaintRef, Paint } from "./Paint";
import { Defs } from "./Defs";
import { LumaColorFilter } from "./colorFilters/LumaColorFilter";
import { Group } from "./Group";

interface MaskProps extends ChildrenProps {
  mode: "luminance" | "alpha";
}

export const Mask = ({ children, mode }: MaskProps) => {
  const paint = usePaintRef();
  const [mask, ...content] = Children.toArray(children);
  return (
    <>
      <Defs>
        <Paint ref={paint}>{mode === "luminance" && <LumaColorFilter />}</Paint>
      </Defs>
      <Group rasterize={paint}>
        {/* We could clip the mask to with the bounds of content. Not sure the overhead is worth it*/}
        <Group>{mask}</Group>
      </Group>
      <Group blendMode="srcIn">{content}</Group>
    </>
  );
};

Mask.defaultProps = {
  mode: "alpha",
};
