import type { RefObject } from "react";
import { useMemo } from "react";

import type { SkiaView } from "../views";
import { peekDrawingContext } from "../renderer/CanvasProvider";

import type { AnimationValue } from "./types";

/**
 * Creates a shared value that can be used in animations and
 * drawing in the Canvas children.
 * @param initialValue
 * @returns A shared value
 */
const create = <T = number>(initialValue: T): AnimationValue<T> => {
  return new AnimationValueImpl<T>(initialValue);
};

/**
 * Creates a shared value that can be used in animations and
 * drawing in the Canvas children.
 * @param initialValue
 * @returns A shared value
 */
export const useValue = <T = number>(initialValue: T): AnimationValue<T> => {
  return useMemo(() => Value.create<T>(initialValue), [initialValue]);
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

  private _value: T;
  private _animation: ((t: number) => number) | undefined;
  private _animationDone:
    | ((animation: (t: number) => number) => void)
    | undefined;
  private _animationViews: Array<RefObject<SkiaView>> = [];
  private _listeners: ((v: T) => void)[] = [];
  private _inUpdate = false;

  public readonly __typename__ = "AnimationValue";

  public startAnimation(
    animation: (t: number) => number,
    onAnimationDone?: (animation: (t: number) => number) => void
  ) {
    this.forceStop();
    this._animation = animation;
    this._animationDone = onAnimationDone;
    // Notify the skia view ref that we have started an animation
    this._animationViews.forEach((view) =>
      view.current?.addAnimation(this._animation)
    );
  }

  private forceStop() {
    if (this._animation) {
      // Notify the skia view ref that we have ended our animation
      this._animationViews.forEach((view) =>
        view.current?.removeAnimation(this._animation)
      );
      this._animationDone?.(this._animation);
      this._animation = undefined;
      this._animationDone = undefined;
    }
  }

  public setValue(value: T) {
    this._value = value;
    // End any ongoing animations - if you are setting the value we know it
    // is done from the outside and we want the animation to be stopped.
    if (this._animation) {
      this.stopAnimation(this._animation);
    }
    // Notify listeners
    this._listeners.forEach((listener) => listener(this._value));
  }

  public stopAnimation(animation: (t: number) => number) {
    if (this._animation && this._animation === animation) {
      this.forceStop();
    }
  }

  public toString() {
    return `${this._value}`;
  }

  public set value(v: T) {
    this.setValue(v);
  }

  public get value(): T {
    if (this._inUpdate) {
      return this._value;
    }
    this._inUpdate = true;
    // We can only animate numbers
    if (typeof this._value === "number") {
      // Check the drawing context list to see if we are inside a drawing function
      const drawingContext = peekDrawingContext();
      if (drawingContext !== undefined) {
        // Save view ref connection.
        if (this._animationViews.indexOf(drawingContext.ref) === -1) {
          this._animationViews.push(drawingContext.ref);
        }

        // Check if we have an ongoing animation
        if (this._animation) {
          // Make sure the skia view is aware that there are animations running
          drawingContext.ref.current?.addAnimation(this._animation);
          // Update value from the current animation - do not call the
          // value property since it will stop the animation
          this._value = this._animation(drawingContext.timestamp) as never as T;
        } else {
          // Stop the skia view from running animations
          drawingContext.ref.current?.removeAnimation(this._animation);
        }
      }
    }
    this._inUpdate = false;
    return this._value;
  }

  /**
   * Adds a listener that will be notified when the value changes.
   * @param listener Callback
   * @returns Unsubscribe method
   */
  public addListener(listener: (v: T) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
    };
  }
}
