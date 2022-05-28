import type {
  ExtendedTouchInfo,
  SkiaValue,
  SkRect,
  TouchHandlers,
  TouchInfo,
} from "@shopify/react-native-skia";
import { isValue, useTouchHandler, inRect } from "@shopify/react-native-skia";

type TouchControl = [TouchHandlers, SkiaValue<SkRect> | SkRect];

type On = {
  (name: "onStart", touch: TouchInfo, controls: TouchControl[]): void;
  (
    name: "onActive" | "onEnd",
    touch: ExtendedTouchInfo,
    controls: TouchControl[]
  ): void;
};

const on: On = (name, touch, controls) => {
  controls.forEach(([control, rect]) => {
    const handler = control[name];
    if (handler) {
      if (inRect(touch, isValue(rect) ? rect.current : rect)) {
        handler(touch as ExtendedTouchInfo);
      }
    }
  });
};

export const useTouchControl = (
  handler: TouchControl[0],
  rect: TouchControl[1]
) => useTouchControls([[handler, rect]]);

export const useTouchControls = (controls: TouchControl[]) => {
  return useTouchHandler({
    onStart: (touch) => {
      on("onStart", touch, controls);
    },
    onActive: (touch) => {
      on("onActive", touch, controls);
    },
    onEnd: (touch) => {
      on("onEnd", touch, controls);
    },
  });
};
