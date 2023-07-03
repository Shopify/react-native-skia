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
      <Group blendMode="srcIn">{children}</Group>
    </Group>
  );
};
