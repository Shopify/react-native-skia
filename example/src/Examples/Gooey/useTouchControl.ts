import type {
  ExtendedTouchInfo,
  SkiaValue,
  SkRect,
  TouchHandlers,
  TouchInfo,
  Vector,
} from "@shopify/react-native-skia";
import {
  dist,
  isValue,
  useTouchHandler,
  inRect,
} from "@shopify/react-native-skia";

interface Circle {
  r: number;
  c: Vector;
}

const isCircle = (area: Circle | SkRect): area is Circle =>
  area.hasOwnProperty("r") && area.hasOwnProperty("c");

type Region<T> = T | SkiaValue<T>;

type TouchControl = [TouchHandlers, Region<SkRect> | Region<Circle>];

type On = {
  (name: "onStart", touch: TouchInfo, controls: TouchControl[]): void;
  (
    name: "onActive" | "onEnd",
    touch: ExtendedTouchInfo,
    controls: TouchControl[]
  ): void;
};

const on: On = (name, touch, controls) => {
  controls.forEach(([control, region]) => {
    const handler = control[name];
    if (handler) {
      const materialized = isValue(region) ? region.current : region;
      if (
        (isCircle(materialized) &&
          dist(touch, materialized.c) <= materialized.r) ||
        inRect(touch, materialized as SkRect)
      ) {
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
