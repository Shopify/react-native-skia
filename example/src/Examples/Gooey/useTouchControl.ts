import type {
  SkiaValue,
  SkRect,
  TouchHandlers,
  Vector,
} from "@shopify/react-native-skia";
import { useTouchHandler } from "@shopify/react-native-skia";

const contains = (pt: Vector, rct: SkRect) =>
  pt.x >= rct.x &&
  pt.x <= rct.y &&
  pt.y >= rct.x + rct.width &&
  pt.y <= rct.y + rct.height;

type TouchControl = [TouchHandlers, SkRect];

export const useTouchControl = (controls: TouchControl[]) => {
  return useTouchHandler({
    onStart: (...args) => {
      controls.forEach(([control, rect]) => {
        if (control.onStart) {
          const [pt] = args;
          if (contains(pt, rect)) {
            control?.onStart(...args);
          }
        }
      });
    },
    onActive: (...args) => {
      controls.forEach(([control, rect]) => {
        if (control.onActive) {
          const [pt] = args;
          if (contains(pt, rect)) {
            control?.onActive(...args);
          }
        }
      });
    },
    onEnd: (...args) => {
      controls.forEach(([control, rect]) => {
        if (control.onEnd) {
          const [pt] = args;
          if (contains(pt, rect)) {
            control?.onEnd(...args);
          }
        }
      });
    },
  });
};
