import React from "react";
import type { ReactNode } from "react";

import { ColorChannel } from "../../../skia/types";
import { createDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";
import { enumKey } from "../../../dom/nodes/datatypes";
import type { SkEnum } from "../../../dom/types";

import { getInput } from "./getInput";

export interface DisplacementMapProps {
  channelX: SkEnum<typeof ColorChannel>;
  channelY: SkEnum<typeof ColorChannel>;
  scale: number;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<DisplacementMapProps>(
  ({ channelX, channelY, scale }, children, { Skia }) => {
    const [in1, in2] = children.filter((c) => !!c);
    const x = ColorChannel[enumKey(channelX)];
    const y = ColorChannel[enumKey(channelY)];
    const map = getInput(Skia, [in1]);
    const input = in2 ? getInput(Skia, [in2]) : null;
    if (!map) {
      throw new Error("No DisplacementMap provided");
    }
    return Skia.ImageFilter.MakeDisplacementMap(x, y, scale, map, input);
  }
);

export const DisplacementMap = (props: AnimatedProps<DisplacementMapProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
