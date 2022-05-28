import type {
  ExtendedTouchInfo,
  SkRect,
  TouchHandlers,
  TouchInfo,
} from "@shopify/react-native-skia";
import { useTouchHandler, inRect } from "@shopify/react-native-skia";

type TouchControl = [TouchHandlers, SkRect];

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
      if (inRect(touch, rect)) {
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
