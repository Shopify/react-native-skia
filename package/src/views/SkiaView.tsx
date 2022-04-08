import React from "react";
import type { ViewProps } from "react-native";
import { requireNativeComponent } from "react-native";

import type { SkImage, SkRect } from "../skia";
import type { SkiaReadonlyValue } from "../values";

import type {
  DrawMode,
  RNSkiaDrawCallback,
  NativeSkiaViewProps,
} from "./types";

let SkiaViewNativeId = 1000;

const NativeSkiaView = requireNativeComponent<NativeSkiaViewProps>(
  "ReactNativeSkiaView"
);

declare global {
  var SkiaViewApi: {
    invalidateSkiaView: (nativeId: number) => void;
    makeImageSnapshot: (nativeId: number, rect?: SkRect) => SkImage;
    setDrawCallback: (
      nativeId: number,
      callback: RNSkiaDrawCallback | undefined
    ) => void;
    setDrawMode: (nativeId: number, mode: DrawMode) => void;
    registerValuesInView: (
      nativeId: number,
      values: SkiaReadonlyValue<unknown>[]
    ) => () => void;
  };
}

const { SkiaViewApi } = global;

export interface SkiaViewProps extends ViewProps {
  /**
   * Sets the drawing mode for the skia view. There are two drawing
   * modes, "continuous" and "default", where the continuous mode will
   * continuously redraw the view, and the default mode will only
   * redraw when any of the regular react properties are changed like
   * sizes and margins.
   */
  mode?: DrawMode;
  /**
   * When set to true the view will display information about the
   * average time it takes to render.
   */
  debug?: boolean;
  /**
   * Draw callback. Will be called whenever the view is invalidated and
   * needs to redraw. This is either caused by a change in a react
   * property, a touch event, or a call to redraw. If the view is in
   * continuous mode the callback will be called 60 frames per second
   * by the native view.
   */
  onDraw?: RNSkiaDrawCallback;
}

export class SkiaView extends React.Component<SkiaViewProps> {
  constructor(props: SkiaViewProps) {
    super(props);
    this._nativeId = SkiaViewNativeId++;
    const { onDraw } = props;
    if (onDraw) {
      assertDrawCallbacksEnabled();
      SkiaViewApi.setDrawCallback(this._nativeId, onDraw);
    }
  }

  private _nativeId: number;

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaViewProps) {
    const { onDraw } = this.props;
    if (onDraw !== prevProps.onDraw) {
      assertDrawCallbacksEnabled();
      SkiaViewApi.setDrawCallback(this._nativeId, onDraw);
    }
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    assertDrawCallbacksEnabled();
    return SkiaViewApi.makeImageSnapshot(this._nativeId, rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertDrawCallbacksEnabled();
    SkiaViewApi.invalidateSkiaView(this._nativeId);
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
    SkiaViewApi.setDrawMode(this._nativeId, mode);
  }

  /**
   * Registers one or move values as a dependant value of the Skia View. The view will
   * The view will redraw itself when any of the values change.
   * @param values Values to register
   */
  public registerValues(values: SkiaReadonlyValue<unknown>[]) {
    assertDrawCallbacksEnabled();
    return SkiaViewApi.registerValuesInView(this._nativeId, values);
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <NativeSkiaView
        collapsable={false}
        nativeID={`${this._nativeId}`}
        mode={mode}
        debug={debug}
        {...viewProps}
      />
    );
  }
}

const assertDrawCallbacksEnabled = () => {
  if (
    SkiaViewApi === null ||
    SkiaViewApi.setDrawCallback == null ||
    SkiaViewApi.invalidateSkiaView == null
  ) {
    throw Error("Skia Api is not enabled.");
  }
};
