/* global HTMLCanvasElement */
import React from "react";
import type { PointerEvent } from "react";
import type { LayoutChangeEvent } from "react-native";

import type { SkRect, SkCanvas } from "../skia/types";
import type { SkiaValue } from "../values";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
import { Platform } from "../Platform";

import type { DrawMode, SkiaBaseViewProps, TouchInfo } from "./types";
import { TouchType } from "./types";

const pd = Platform.PixelRatio;

export abstract class SkiaBaseWebView<
  TProps extends SkiaBaseViewProps
> extends React.Component<TProps> {
  constructor(props: TProps) {
    super(props);
    this._mode = props.mode ?? "default";
  }

  private _surface: JsiSkSurface | null = null;
  private _unsubscriptions: Array<() => void> = [];
  private _touches: Array<TouchInfo> = [];
  private _canvas: SkCanvas | null = null;
  private _canvasRef = React.createRef<HTMLCanvasElement>();
  private _mode: DrawMode;
  private _redrawRequests = 0;
  private requestId = 0;

  protected width = 0;
  protected height = 0;

  private unsubscribeAll() {
    this._unsubscriptions.forEach((u) => u());
    this._unsubscriptions = [];
  }

  private onLayoutEvent(evt: LayoutChangeEvent) {
    const { CanvasKit } = global;
    // Reset canvas / surface on layout change
    const canvas = this._canvasRef.current;
    if (canvas) {
      this.width = canvas.clientWidth;
      this.height = canvas.clientHeight;
      canvas.width = this.width * pd;
      canvas.height = this.height * pd;
      const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
      if (!surface) {
        throw new Error("Could not create surface");
      }
      this._surface = new JsiSkSurface(CanvasKit, surface);
      this._canvas = this._surface.getCanvas();
      this.redraw();
    }
    // Call onLayout callback if it exists
    if (this.props.onLayout) {
      this.props.onLayout(evt);
    }
  }

  protected getSize() {
    return { width: this.width, height: this.height };
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
    cancelAnimationFrame(this.requestId);
    // eslint-disable-next-line max-len
    // https://stackoverflow.com/questions/23598471/how-do-i-clean-up-and-unload-a-webgl-canvas-context-from-gpu-after-use
    // https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context
    // We delete the context, only if the context has been intialized
    if (this._surface) {
      this._canvasRef.current
        ?.getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext();
    }
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    this._canvas!.clear(CanvasKit.TRANSPARENT);
    this.renderInCanvas(this._canvas!, []);
    this._surface?.ref.flush();
    return this._surface?.makeImageSnapshot(rect);
  }

  /**
   * Override to render
   */
  protected abstract renderInCanvas(
    canvas: SkCanvas,
    touches: TouchInfo[]
  ): void;

  /**
   * Sends a redraw request to the native SkiaView.
   */
  private tick() {
    if (this._mode === "continuous" || this._redrawRequests > 0) {
      this._redrawRequests = 0;
      if (this._canvas) {
        const touches = [...this._touches];
        this._touches = [];
        const canvas = this._canvas!;
        canvas.clear(Float32Array.of(0, 0, 0, 0));
        canvas.save();
        canvas.scale(pd, pd);
        this.renderInCanvas(canvas, touches);
        canvas.restore();
        this._surface?.ref.flush();
      }
    }
    this.requestId = requestAnimationFrame(this.tick.bind(this));
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

  private onStart = this.createTouchHandler(TouchType.Start);
  private onActive = this.createTouchHandler(TouchType.Active);
  private onCancel = this.createTouchHandler(TouchType.Cancelled);
  private onEnd = this.createTouchHandler(TouchType.End);
  private onLayout = this.onLayoutEvent.bind(this);

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <Platform.View {...viewProps} onLayout={this.onLayout}>
        <canvas
          ref={this._canvasRef}
          style={{ display: "flex", flex: 1 }}
          onPointerDown={this.onStart}
          onPointerMove={this.onActive}
          onPointerUp={this.onEnd}
          onPointerCancel={this.onCancel}
          onPointerLeave={this.onEnd}
          onPointerOut={this.onEnd}
        />
      </Platform.View>
    );
  }
}
