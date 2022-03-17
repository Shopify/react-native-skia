/* global SkiaViewApi:false */

import React from "react";

import type { SkRect } from "../skia";
import type { SkiaReadonlyValue } from "../values";

import { NativeSkiaView } from "./types";
import type {
  DrawMode,
  RNSkiaDrawCallback,
  RNSkiaViewProps,
  TouchHandler,
} from "./types";

let SkiaViewNativeId = 1000;

export class SkiaView extends React.Component<RNSkiaViewProps> {
  constructor(props: RNSkiaViewProps) {
    super(props);
    this._nativeId = `${SkiaViewNativeId++}`;
    const { onDraw, onTouch } = props;
    if (onDraw) {
      assertDrawCallbacksEnabled();
      setDrawCallback(this._nativeId, onDraw);
    }
    if (onTouch) {
      setTouchHandler(this._nativeId, onTouch);
    }
  }

  private _nativeId: string;
  private _animatingValues: Array<unknown> = [];

  public get nativeId() {
    return this._nativeId;
  }

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
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    assertDrawCallbacksEnabled();
    return makeImageSnapshot(this._nativeId, rect);
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
   * Registers one or move values as a dependant value of the Skia View. The view will
   * The view will redraw itself when any of the values change.
   * @param value Value to register
   */
  public registerValues(values: SkiaReadonlyValue<unknown>[]) {
    assertDrawCallbacksEnabled();
    return registerValuesInSkiaView(this._nativeId, values);
  }

  /**
   * Increases the number of animations active in the view.
   */
  public addAnimation(owner: unknown) {
    if (this._animatingValues.findIndex((p) => p === owner) === -1) {
      this._animatingValues.push(owner);
    }

    if (this._animatingValues.length === 1) {
      if (this.props.mode === "default" || this.props.mode === undefined) {
        //console.log("SkiaView addAnimation - mode changed to continous");
        this.setDrawMode("continuous");
      }
    }
  }

  /**
   * Decreases the number of animations active in the view.
   */
  public removeAnimation(owner: unknown) {
    const indexOfOwner = this._animatingValues.indexOf(owner);
    if (indexOfOwner !== -1) {
      // Remove
      this._animatingValues = this._animatingValues.filter((p) => p !== owner);
    }
    if (this._animatingValues.length === 0) {
      if (this.props.mode === "default" || this.props.mode === undefined) {
        //console.log("SkiaView removeAnimation - mode changed to default");
        this.setDrawMode("default");
      }
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

const setTouchHandler = (
  nativeId: string,
  touchHandler: TouchHandler | undefined
) => {
  return SkiaViewApi.setTouchHandler(parseInt(nativeId, 10), touchHandler);
};

export const invalidateSkiaView = (nativeId: string) => {
  SkiaViewApi.invalidateSkiaView(parseInt(nativeId, 10));
};

export const makeImageSnapshot = (nativeId: string, rect?: SkRect) => {
  return SkiaViewApi.makeImageSnapshot(parseInt(nativeId, 10), rect);
};

const setDrawingModeForSkiaView = (nativeId: string, mode: DrawMode) => {
  SkiaViewApi.setDrawMode(parseInt(nativeId, 10), mode);
};

const registerValuesInSkiaView = (
  nativeId: string,
  values: SkiaReadonlyValue<unknown>[]
) => {
  return SkiaViewApi.registerValuesInView(parseInt(nativeId, 10), values);
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
