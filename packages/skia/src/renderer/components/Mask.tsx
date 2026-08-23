import type { ReactNode } from "react";
import React from "react";

import { Group } from "./Group";
import { LumaColorFilter } from "./colorFilters/LumaColorFilter";
import { Paint } from "./Paint";

interface MaskProps {
  mode?: "luminance" | "alpha";
  clip?: boolean;
  mask: ReactNode | ReactNode[];
  children: ReactNode | ReactNode[];
}

export const Mask = ({
  children,
  mask,
  mode = "alpha",
  clip = true,
}: MaskProps) => {
  return (
    <Group layer>
      <Group
        layer={
          <Paint blendMode="src">
            {mode === "luminance" && <LumaColorFilter />}
          </Paint>
        }
      >
        {mask}
        {clip && <Group layer={<Paint blendMode="dstIn" />}>{children}</Group>}
      </Group>
      {/* blendMode on a <Group> is a paint property, so it is applied once per
          draw call inside the group. srcIn replaces the destination within the
          coverage of each draw, so with more than one child every child after
          the first is composited against the previous child instead of against
          the mask. Requesting a layer composites the children together first
          and applies srcIn once, to the group as a whole. */}
      <Group layer={<Paint blendMode="srcIn" />}>{children}</Group>
    </Group>
  );
};
