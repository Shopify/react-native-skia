import type { SkiaAnimation, SkiaValue } from "../types";

import { RNSkReadonlyValue } from "./RNSkReadonlyValue";

export class RNSkValue<T> extends RNSkReadonlyValue<T> implements SkiaValue<T> {
  constructor(value: T) {
    super(value);
    this._unsubscribe = undefined;
  }

  public set current(value: T) {
    this.update(value);
  }

  public get current(): T {
    return super.current;
  }

  private _unsubscribe: (() => void) | undefined;

  private unsubscribe() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = undefined;
    }
    if (this._animation) {
      this._animation.cancel();
      this._animation = undefined;
    }
  }

  private subscribe(animation: SkiaAnimation | undefined) {
    this.unsubscribe();
    if (animation) {
      this._animation = animation;
      this._unsubscribe = animation.addListener(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.animationDidUpdate.bind(this)
      );
      this._animation.start();
    }
  }

  private animationDidUpdate(value: T) {
    this.update(value);
  }

  private _animation: SkiaAnimation | undefined;
  public get animation(): SkiaAnimation | undefined {
    return this._animation;
  }

  public set animation(v: SkiaAnimation | undefined) {
    this.subscribe(v);
  }
}
