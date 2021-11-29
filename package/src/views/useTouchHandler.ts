import { useCallback, useRef } from "react";

import type { TouchInfo } from "./types";
import { TouchType } from "./types";

type ExtendedTouchInfo = TouchInfo & {
  // points per second
  velocityX: number;
  velocityY: number;
};

type TouchHandlers = {
  onStart?: (touchInfo: TouchInfo) => void;
  onMove?: (touchInfo: ExtendedTouchInfo) => void;
  onEnd?: (touchInfo: ExtendedTouchInfo) => void;
};

/**
 * Provides a callback for handling touch events in the Skia View.
 * This touch handler only handles single taps.
 * @param handlers Callbacks for the different touch states
 * @returns A function that can be used from within the onDraw callback to
 * update and handle touch events. Call it with the touches property from
 * the info object.
 */
export const useTouchHandler = (handlers: TouchHandlers) => {
  const prevTouchInfoRef = useRef<TouchInfo>();

  return useCallback(
    (history: Array<Array<TouchInfo>>) => {
      // Process all items in the current touch history
      history.forEach((touches) => {
        if (touches.length === 0) {
          return;
        }
        // Get the next touch
        const touch = touches[0];

        // Calculate the velocity from the previous touch.
        // Start by calculating the time difference between the current and the
        // previous touch.
        const timeDiffseconds =
          touch.timestamp -
          (prevTouchInfoRef.current?.timestamp ?? touch.timestamp);

        const distX = touch.x - (prevTouchInfoRef.current?.x ?? touch.x);
        const distY = touch.y - (prevTouchInfoRef.current?.y ?? touch.y);

        const velocityX = distX / timeDiffseconds;
        const velocityY = distY / timeDiffseconds;

        const extendedTouchInfo: ExtendedTouchInfo = {
          ...touch,
          velocityX: Math.abs(velocityX),
          velocityY: Math.abs(velocityY),
        };

        // Save previous touch
        prevTouchInfoRef.current = touch;

        if (touch.type === TouchType.Start) {
          handlers.onStart && handlers.onStart(touch);
        } else if (touch.type === TouchType.Active) {
          handlers.onMove && handlers.onMove(extendedTouchInfo);
        } else {
          handlers.onMove && handlers.onMove(extendedTouchInfo);
          handlers.onEnd && handlers.onEnd(extendedTouchInfo);
        }
      });
    },
    [handlers]
  );
};
