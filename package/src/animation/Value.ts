import type React from "react";

import type { SkiaView } from "../views";
import { peekDrawingContext } from "../renderer/CanvasProvider";

import type { Animation, AnimationValue } from "./types";

/**
 * Creates a shared value that can be used in animations and
 * drawing in the Canvas children.
 * @param initialValue
 * @returns A shared value
 */
const create = <T = number>(initialValue: T): AnimationValue<T> => {
  return new AnimationValueImpl<T>(initialValue);
};

export const Value = {
  create,
};

class AnimationValueImpl<T = number> implements AnimationValue<T> {
  constructor(initialValue: T) {
    this._value = initialValue;
    this._animation = undefined;
    this._animationDone = undefined;
  }

  _value: T;
  _animation: Animation | undefined;
  _animationDone: ((animation: Animation) => void) | undefined;
  _animationViews: Array<React.RefObject<SkiaView>> = [];

  public startAnimation(
    animation: Animation,
    onAnimationDone?: (animation: Animation) => void
  ) {
    this._animation = animation;
    this._animationDone = onAnimationDone;
    // Notify the skia view ref that we have started an animation
    this._animationViews.forEach((view) =>
      view.current?.addAnimation(this._animation)
    );
  }

  public stopAnimation(animation: Animation) {
    if (this._animation && this._animation === animation) {
      // Notify the skia view ref that we have ended our animation
      this._animationViews.forEach((view) =>
        view.current?.removeAnimation(this._animation)
      );
      this._animationDone?.(this._animation);
      this._animation = undefined;
      this._animationDone = undefined;
    }
  }

  public toString() {
    return `${this._value}`;
  }

  public get value(): T {
    // We can only animate numbers
    if (typeof this._value === "number") {
      // Check the drawing context list to see if we are inside a drawing function
      const drawingContext = peekDrawingContext();
      if (drawingContext !== undefined) {
        // Save view ref connection.
        if (this._animationViews.indexOf(drawingContext.skiaRef) === -1) {
          this._animationViews.push(drawingContext.skiaRef);
        }

        // Check if we have an ongoing animation
        if (this._animation) {
          // Make sure the skia view is aware that there are animations running
          drawingContext.skiaRef.current?.addAnimation(this._animation);
          // Update value from the current animation - do not call the
          // value property since it will stop the animation
          this._value = this._animation.evaluate(
            drawingContext.timestamp
          ) as never as T;
        } else {
          // Stop the skia view from running animations
          drawingContext.skiaRef.current?.removeAnimation(this._animation);
        }
      }
    }
    return this._value;
  }

  public set value(v: T) {
    this._value = v;
    // End any ongoing animations - if you are setting the value we know it
    // is done from the outside and we want the animation to be stopped.
    if (this._animation) {
      this.stopAnimation(this._animation);
    }
  }
}
