/* global SkiaViewApi:false */

import React from "react";

import { NativeSkiaView } from "./types";
import type { RNSkiaDrawCallback, RNSkiaViewProps } from "./types";

import type { DrawMode } from ".";

let SkiaViewNativeId = 1000;

export class SkiaView extends React.Component<RNSkiaViewProps> {
  constructor(props: RNSkiaViewProps) {
    super(props);
    this._nativeId = `${SkiaViewNativeId++}`;
    const { onDraw } = props;
    if (onDraw) {
      assertDrawCallbacksEnabled();
      setDrawCallback(this._nativeId, onDraw);
    }
  }

  private _nativeId: string;
  private _isAnimating = false;
  private _animatingValues: Array<unknown> = [];

  componentDidUpdate(prevProps: RNSkiaViewProps) {
    const { onDraw } = this.props;
    if (onDraw !== prevProps.onDraw) {
      assertDrawCallbacksEnabled();
      if (prevProps.onDraw) {
        setDrawCallback(this._nativeId, undefined);
      }
      if (onDraw) {
        setDrawCallback(this._nativeId, onDraw);
      }
    }
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertDrawCallbacksEnabled();
    invalidateSkiaView(this._nativeId);
  }

  /**
   * Updates the drawing mode for the skia view. This is the same
   * as declaratively setting the mode property on the SkiaView.
   * There are two drawing modes, "continuous" and "default",
   * where the continuous mode will continuously redraw the view and
   * the default mode will only redraw when any of the regular react
   * properties are changed like size and margins.
   * @param mode Drawing mode to use.
   */
  public setDrawMode(mode: DrawMode) {
    assertDrawCallbacksEnabled();
    setDrawingModeForSkiaView(this._nativeId, mode);
  }

  /**
   * Increases the number of animations active in the view.
   */
  public startAnimation(owner: unknown) {
    if (this._animatingValues.findIndex((p) => p === owner) === -1) {
      this._animatingValues.push(owner);
    }

    if (!this._isAnimating) {
      this._isAnimating = true;
      (this.props.mode === "default" || this.props.mode === undefined) &&
        this.setDrawMode("continuous");
      setImmediate(this.redraw);
    }
  }

  /**
   * Decreases the number of animations active in the view.
   */
  public endAnimation(owner: unknown) {
    const indexOfOwner = this._animatingValues.indexOf(owner);
    if (indexOfOwner !== -1) {
      // Remove
      this._animatingValues.splice(this._animatingValues.indexOf(owner), 1);
    }
    if (this._isAnimating && this._animatingValues.length === 0) {
      (this.props.mode === "default" || this.props.mode === undefined) &&
        this.setDrawMode("default");
      this._isAnimating = false;
      setImmediate(this.redraw);
    }
  }

  render() {
    const { style, mode, debug = false } = this.props;
    return (
      <NativeSkiaView
        style={style}
        collapsable={false}
        nativeID={this._nativeId}
        mode={mode}
        debug={debug}
      />
    );
  }
}

const setDrawCallback = (
  nativeId: string,
  drawCallback: RNSkiaDrawCallback | undefined
) => {
  return SkiaViewApi.setDrawCallback(parseInt(nativeId, 10), drawCallback);
};

const invalidateSkiaView = (nativeId: string) => {
  SkiaViewApi.invalidateSkiaView(parseInt(nativeId, 10));
};

const setDrawingModeForSkiaView = (nativeId: string, mode: DrawMode) => {
  SkiaViewApi.setDrawMode(parseInt(nativeId, 10), mode);
};

const assertDrawCallbacksEnabled = () => {
  if (
    SkiaViewApi === null ||
    SkiaViewApi.setDrawCallback == null ||
    SkiaViewApi.invalidateSkiaView == null
  ) {
    throw Error("Skia Api is not enabled.");
  }
};
