/* global HTMLCanvasElement */
import React from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import type { SkRect, SkCanvas } from "../skia/types";
import type { SkiaValue } from "../values";
import { JsiSkSurface } from "../skia/web/api/JsiSkSurface";

import type { DrawingInfo, DrawMode, SkiaViewProps } from "./types";

export class SkiaView extends React.Component<
  SkiaViewProps,
  { width: number; height: number }
> {
  constructor(props: SkiaViewProps) {
    super(props);
    this.state = { width: -1, height: -1 };
  }

  private _surface: JsiSkSurface | null = null;
  private _unsubscriptions: Array<() => void> = [];
  private _canvas: SkCanvas | null = null;
  private _canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  private _mode: DrawMode = "default";

  private unsubscribeAll() {
    this._unsubscriptions.forEach((u) => u());
    this._unsubscriptions = [];
  }

  private onLayout(evt: LayoutChangeEvent) {
    this.setState({
      width: evt.nativeEvent.layout.width,
      height: evt.nativeEvent.layout.height,
    });
    // Reset canvas / surface on layout change
    if (this._canvasRef.current) {
      this._surface = new JsiSkSurface(
        global.CanvasKit,
        global.CanvasKit.MakeCanvasSurface(this._canvasRef.current)!
      );
      if (this._surface) {
        this._canvas = this._surface.getCanvas();
        this.redraw();
      }
    }
  }

  componentWillUnmount() {
    this.unsubscribeAll();
  }

  componentDidUpdate() {}

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(_rect?: SkRect) {
    return this._surface?.makeImageSnapshot(_rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    if (
      this._canvas &&
      this.props.onDraw &&
      this.state.height !== -1 &&
      this.state.width !== -1
    ) {
      const info: DrawingInfo = {
        height: this.state.height,
        width: this.state.width,
        timestamp: Date.now(),
        touches: [], // TODO: Fix touch handling
      };
      this._surface?.ref.drawOnce(
        () => this.props.onDraw && this.props.onDraw(this._canvas!, info)
      );
      if (this._mode === "continuous") {
        requestAnimationFrame(() => this.redraw());
      }
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
  public setDrawMode(mode: DrawMode) {
    this._mode = mode;
    this.redraw();
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
            ref={this._canvasRef}
            width={`${this.state.width}px`}
            height={`${this.state.height}px`}
          />
        ) : null}
      </View>
    );
  }
}
