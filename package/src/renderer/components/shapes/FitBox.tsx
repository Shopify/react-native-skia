import type { ReactNode } from "react";
import React, { useMemo } from "react";

import type { Fit } from "../../../dom/nodes";
import { fitRects, rect2rect } from "../../../dom/nodes";
import type { SkRect, Transforms3d } from "../../../skia/types";
import { Group } from "../Group";

interface FitProps {
  fit?: Fit;
  src: SkRect;
  dst: SkRect;
  children: ReactNode | ReactNode[];
}

export const fitbox = (
  fit: Fit,
  src: SkRect,
  dst: SkRect,
  rotation: 0 | 90 | 180 | 270 = 0
) => {
  "worklet";
  const rects = fitRects(
    fit,
    rotation === 90 || rotation === 270
      ? { x: 0, y: 0, width: src.height, height: src.width }
      : src,
    dst
  );
  const result = rect2rect(rects.src, rects.dst);
  if (rotation === 90) {
    return [
      ...result,
      { translate: [src.height, 0] },
      { rotate: Math.PI / 2 },
    ] as Transforms3d;
  }
  if (rotation === 180) {
    return [
      ...result,
      { translate: [src.width, src.height] },
      { rotate: Math.PI },
    ] as Transforms3d;
  }
  if (rotation === 270) {
    return [
      ...result,
      { translate: [0, src.width] },
      { rotate: -Math.PI / 2 },
    ] as Transforms3d;
  }
  return result;
};

export const FitBox = ({ fit = "contain", src, dst, children }: FitProps) => {
  const transform = useMemo(() => fitbox(fit, src, dst), [dst, fit, src]);
  return <Group transform={transform}>{children}</Group>;
};
