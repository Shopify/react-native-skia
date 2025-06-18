import React, { useMemo } from "react";
import { fitRects, rect2rect } from "../../../dom/nodes";
import { Group } from "../Group";
export const fitbox = (fit, src, dst, rotation = 0) => {
  "worklet";

  const rects = fitRects(fit, rotation === 90 || rotation === 270 ? {
    x: 0,
    y: 0,
    width: src.height,
    height: src.width
  } : src, dst);
  const result = rect2rect(rects.src, rects.dst);
  if (rotation === 90) {
    return [...result, {
      translate: [src.height, 0]
    }, {
      rotate: Math.PI / 2
    }];
  }
  if (rotation === 180) {
    return [...result, {
      translate: [src.width, src.height]
    }, {
      rotate: Math.PI
    }];
  }
  if (rotation === 270) {
    return [...result, {
      translate: [0, src.width]
    }, {
      rotate: -Math.PI / 2
    }];
  }
  return result;
};
export const FitBox = ({
  fit = "contain",
  src,
  dst,
  children
}) => {
  const transform = useMemo(() => fitbox(fit, src, dst), [dst, fit, src]);
  return /*#__PURE__*/React.createElement(Group, {
    transform: transform
  }, children);
};
//# sourceMappingURL=FitBox.js.map