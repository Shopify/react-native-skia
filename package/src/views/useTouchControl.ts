import { inRect } from "../renderer/processors/Rects";
import { isValue } from "../renderer/processors/Animations";
import { dist } from "../renderer/processors/math/Vector";
import type { SkRect, SkPoint } from "../skia/types";
import type { SkiaValue } from "../values";

import type { ExtendedTouchInfo, TouchHandlers, TouchInfo } from "./types";
import { useTouchHandler } from "./useTouchHandler";

interface Circle {
  r: number;
  c: SkPoint;
}

const isCircle = (area: Circle | SkRect): area is Circle =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (area as any).r !== undefined && (area as any).c !== undefined;

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
