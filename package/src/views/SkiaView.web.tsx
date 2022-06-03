import React from "react";
import type { LayoutChangeEvent, ViewProps } from "react-native";
import { View } from "react-native";
import type { Canvas, Surface } from "canvaskit-wasm";

import type { SkCanvas, SkRect } from "../skia";
import type { SkiaValue } from "../values";

import type { DrawingInfo, DrawMode, RNSkiaDrawCallback } from "./types";

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

let NativeIdCounter = 1000;

export class SkiaView extends React.Component<
  SkiaViewProps,
  { width: number; height: number }
> {
  constructor(props: SkiaViewProps) {
    super(props);
    this._nativeId = NativeIdCounter++;
    this.state = { width: -1, height: -1 };
  }

  private _nativeId: number;
  private _surface: Surface | null = null;
  private _unsubscriptions: Array<() => void> = [];
  //private _mode: DrawMode = "default";

  private getKey() {
    return `rnskia-${this._nativeId}`;
  }

  private unsubscribeAll() {
    this._unsubscriptions.forEach((u) => u());
    this._unsubscriptions = [];
  }

  private onLayout(evt: LayoutChangeEvent) {
    this.setState({
      width: evt.nativeEvent.layout.width,
      height: evt.nativeEvent.layout.height,
    });
    this.redraw();
  }

  componentWillUnmount() {
    this.unsubscribeAll();
  }

  componentDidUpdate() {
    if (this._surface === null && this.state.width > -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._surface = global.CanvasKit.MakeCanvasSurface(this.getKey());
      this.redraw();
    }
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(_rect?: SkRect) {
    // TODO!
    return null;
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    if (
      this.props.onDraw &&
      this._surface &&
      this.state.height !== -1 &&
      this.state.width !== -1
    ) {
      const info: DrawingInfo = {
        height: this.state.height,
        width: this.state.width,
        timestamp: Date.now(),
        touches: [],
      };
      const draw = (canvas: Canvas) => {
        this.props.onDraw &&
          this.props.onDraw(canvas as unknown as SkCanvas, info);
      };
      this._surface.drawOnce(draw);
    }
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
  public setDrawMode(_mode: DrawMode) {
    // this._mode = mode;
  }

  /**
   * Registers one or move values as a dependant value of the Skia View. The view will
   * The view will redraw itself when any of the values change.
   * @param values Values to register
   */
  public registerValues(_values: SkiaValue<unknown>[]) {
    // Unsubscribe from dependency values
    this.unsubscribeAll();
    // Register redraw dependencies on values
    _values.forEach((v) => {
      this._unsubscriptions.push(
        v.addListener(() => {
          this.redraw();
        })
      );
    });
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <View {...viewProps} onLayout={this.onLayout.bind(this)}>
        {this.state.width > -1 ? (
          <canvas
            id={this.getKey()}
            width={`${this.state.width}px`}
            height={`${this.state.height}px`}
          />
        ) : null}
      </View>
    );
  }
}
