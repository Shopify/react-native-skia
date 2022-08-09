/* global HTMLCanvasElement */
import React from "react";
import type { PointerEvent } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";

import type { SkRect, SkCanvas } from "../skia/types";
import type { SkiaValue } from "../values";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";

import type { DrawingInfo, DrawMode, SkiaViewProps, TouchInfo } from "./types";
import { TouchType } from "./types";

export class SkiaView extends React.Component<
  SkiaViewProps,
  { width: number; height: number }
> {
  constructor(props: SkiaViewProps) {
    super(props);
    this.state = { width: -1, height: -1 };
    this._mode = props.mode ?? "default";
  }

  private _surface: JsiSkSurface | null = null;
  private _unsubscriptions: Array<() => void> = [];
  private _touches: Array<TouchInfo> = [];
  private _canvas: SkCanvas | null = null;
  private _canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  private _mode: DrawMode;
  private _redrawRequests = 0;
  private _unmounted = false;

  private unsubscribeAll() {
    this._unsubscriptions.forEach((u) => u());
    this._unsubscriptions = [];
  }

  private onLayout(evt: LayoutChangeEvent) {
    this.setState(
      {
        width: evt.nativeEvent.layout.width,
        height: evt.nativeEvent.layout.height,
      },
      () => {
        // Reset canvas / surface on layout change
        if (this._canvasRef.current) {
          // Create surface
          this._surface = new JsiSkSurface(
            global.CanvasKit,
            global.CanvasKit.MakeWebGLCanvasSurface(this._canvasRef.current)!
          );
          // Get canvas and repaint
          if (this._surface) {
            this._canvas = this._surface.getCanvas();
            this.redraw();
          }
        }
      }
    );
  }

  componentDidMount() {
    // Start render loop
    this.tick();
  }

  componentDidUpdate() {
    this.redraw();
  }

  componentWillUnmount() {
    this.unsubscribeAll();
    this._surface = null;
    this._canvas = null;
    this._unmounted = true;
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    return this._surface?.makeImageSnapshot(rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  private tick() {
    if (this._mode === "continuous" || this._redrawRequests > 0) {
      this._redrawRequests = 0;
      if (
        this._canvas &&
        this.props.onDraw &&
        this.state.height !== -1 &&
        this.state.width !== -1
      ) {
        const touches = [...this._touches];
        this._touches = [];
        const info: DrawingInfo = {
          height: this.state.height,
          width: this.state.width,
          timestamp: Date.now(),
          touches: touches.map((t) => [t]),
        };
        this.props.onDraw && this.props.onDraw(this._canvas!, info);
        this._surface?.ref.flush();
      }
    }
    // Always request a new redraw as long as we're not unmounted
    if (!this._unmounted) {
      requestAnimationFrame(this.tick.bind(this));
    }
  }

  public redraw() {
    this._redrawRequests++;
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
    this.tick();
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

  private handleTouchEvent(evt: PointerEvent, touchType: TouchType) {
    this._touches.push({
      id: evt.pointerId,
      x: evt.clientX - evt.currentTarget.getClientRects()[0].left,
      y: evt.clientY - evt.currentTarget.getClientRects()[0].top,
      force: evt.pressure,
      type: touchType,
      timestamp: Date.now(),
    });
    this.redraw();
  }

  createTouchHandler(touchType: TouchType) {
    return (evt: PointerEvent) => this.handleTouchEvent(evt, touchType);
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <View {...viewProps} onLayout={this.onLayout.bind(this)}>
        <canvas
          ref={this._canvasRef}
          width={this.state.width}
          height={this.state.height}
          onPointerDown={this.createTouchHandler(TouchType.Start)}
          onPointerMove={this.createTouchHandler(TouchType.Active)}
          onPointerUp={this.createTouchHandler(TouchType.End)}
          onPointerCancel={this.createTouchHandler(TouchType.Cancelled)}
          onPointerLeave={this.createTouchHandler(TouchType.End)}
          onPointerOut={this.createTouchHandler(TouchType.End)}
        />
      </View>
    );
  }
}
