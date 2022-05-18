import type { SkiaClockValue } from "../types";

import { RNSkReadonlyValue } from "./RNSkReadonlyValue";

enum RNSkClockState {
  NotStarted = 0,
  Running = 1,
  Stopped = 2,
}

export class RNSkClockValue
  extends RNSkReadonlyValue<number>
  implements SkiaClockValue
{
  constructor(raf: (callback: (time: number) => void) => number) {
    super(0);
    this._raf = raf;
    this.update(0);
  }

  private _raf: (callback: (time: number) => void) => number;
  private _start: number | undefined;
  private _stop: number | undefined;
  private _state: RNSkClockState = RNSkClockState.NotStarted;

  private notifyUpdate = (_: number) => {
    if (this._state === RNSkClockState.Running) {
      const now = Date.now();
      const deltaFromStart = now - this._start!;
      this.tick(deltaFromStart);
      this._raf(this.notifyUpdate);
    }
  };

  protected tick(value: number) {
    this.update(value);
  }

  public start() {
    if (this._state === RNSkClockState.NotStarted) {
      this._start = Date.now();
      this._stop = this._start;
    }
    // Subtract pause time from start
    const timeSinceStop = Date.now() - this._stop!;
    this._start! += timeSinceStop;

    this._state = RNSkClockState.Running;
    this._raf(this.notifyUpdate);
  }

  public stop() {
    if (this._state === RNSkClockState.Running) {
      this._state = RNSkClockState.Stopped;
      this._stop = Date.now();
    }
  }
}
