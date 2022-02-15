import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { SkEnum, AnimatedProps } from "../../processors";
import { enumKey } from "../../processors";
import { ColorChannel } from "../../../skia/ImageFilter/ImageFilterFactory";

import { getInput } from "./getInput";

export interface DisplacementMapProps {
  channelX: SkEnum<typeof ColorChannel>;
  channelY: SkEnum<typeof ColorChannel>;
  scale: number;
  children?: ReactNode | ReactNode[];
}

export const DisplacementMap = (props: AnimatedProps<DisplacementMapProps>) => {
  const declaration = useDeclaration(
    props,
    ({ channelX, channelY, scale }, children) => {
      const [in1, in2] = children.filter((c) => !!c);
      const x = ColorChannel[enumKey(channelX)];
      const y = ColorChannel[enumKey(channelY)];
      const map = getInput([in1]);
      const input = in2 ? getInput([in2]) : null;
      if (!map) {
        throw new Error("No DisplacementMap provided");
      }
      return Skia.ImageFilter.MakeDisplacementMap(x, y, scale, map, input);
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
