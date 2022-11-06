/* eslint-disable max-len */
import React, { useRef, forwardRef } from "react";

import type { SkiaProps } from "../processors";
import type { DrawingNodeProps } from "../../dom/types";
import type { PaintNode } from "../../dom/nodes/PaintNode";

export const usePaintRef = () => {
  console.log(`usePaintRef() is now deprecated.
If you are using the layer property, simply pass the component directly: https://shopify.github.io/react-native-skia/docs/group#layer-effects.
If you are using the paint property, please the following paint properties directly: https://shopify.github.io/react-native-skia/docs/paint/overview`);
  return useRef<PaintNode>(null);
};

export const Paint = forwardRef<PaintNode, SkiaProps<DrawingNodeProps>>(
  (props, ref) => {
    return <skPaint ref={ref} {...props} />;
  }
);
