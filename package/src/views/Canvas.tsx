/* global HTMLCanvasElement */
import React from "react";
import type { PointerEvent, ReactNode } from "react";

import type { SkRect, SkCanvas, SkSize } from "../skia/types";
import type { SkiaMutableValue, SkiaValue } from "../values";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
import { Skia } from "../skia";
import { SkiaRoot } from "../renderer/Reconciler";

import type { DrawMode, TouchHandler, TouchInfo } from "./types";
import { TouchType } from "./types";

const pd = window.devicePixelRatio;

type PointerEvents =
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onPointerLeave"
  | "onPointerOut";
interface CanvasProps
  extends Omit<React.HTMLAttributes<HTMLCanvasElement>, PointerEvents> {
  mode?: DrawMode;
  onTouch?: TouchHandler;
  onSize?: SkiaMutableValue<SkSize>;
  debug?: boolean;
  children?: ReactNode;
}

export class Canvas extends React.Component<CanvasProps> {
  constructor(props: CanvasProps) {
    super(props);
    this._mode = props.mode ?? "default";
    this.root = new SkiaRoot(Skia, this.registerValues.bind(this), this.redraw);
  }

  private paint = Skia.Paint();
  private root: SkiaRoot;
  private observer: ResizeObserver | null = null;
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

  private onLayout(width: number, height: number) {
    const { CanvasKit } = global;
    this.width = width;
    this.height = height;
    // Reset canvas / surface on layout change
    if (this._canvasRef.current) {
      const canvas = this._canvasRef.current;
      canvas.width = width * pd;
      canvas.height = height * pd;
      const surface = CanvasKit.MakeWebGLCanvasSurface(this._canvasRef.current);
      if (!surface) {
        throw new Error("Could not create surface");
      }
      this._surface = new JsiSkSurface(CanvasKit, surface);
      this._canvas = this._surface.getCanvas();
      this.redraw();
    }
  }

  protected getSize() {
    return { width: this.width, height: this.height };
  }

  componentDidMount() {
    const resizeObserver = new ResizeObserver(
      ([
        {
          contentRect: { width, height },
        },
      ]) => {
        this.onLayout(width, height);
      }
    );
    resizeObserver.observe(this._canvasRef.current!);
    // Start render loop
    this.tick();
  }

  componentDidUpdate() {
    this.redraw();
  }

  componentWillUnmount() {
    this.unsubscribeAll();
    cancelAnimationFrame(this.requestId);
    this.root.unmount();
    this.observer?.unobserve(this._canvasRef.current!);
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
   * Override to render
   */
  protected renderInCanvas(canvas: SkCanvas, touches: TouchInfo[]) {
    if (this.props.onTouch) {
      this.props.onTouch([touches]);
    }
    if (this.props.onSize) {
      const { width, height } = this.getSize();
      this.props.onSize.current = { width, height };
    }
    const ctx = {
      canvas,
      paint: this.paint,
    };
    this.root.render(this.props.children);
    this.root.dom.render(ctx);
  }

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
    return () => this.unsubscribeAll();
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
    const { style, children, ...props } = this.props;
    return (
      <canvas
        ref={this._canvasRef}
        onPointerDown={this.createTouchHandler(TouchType.Start)}
        onPointerMove={this.createTouchHandler(TouchType.Active)}
        onPointerUp={this.createTouchHandler(TouchType.End)}
        onPointerCancel={this.createTouchHandler(TouchType.Cancelled)}
        onPointerLeave={this.createTouchHandler(TouchType.End)}
        onPointerOut={this.createTouchHandler(TouchType.End)}
        {...props}
      />
    );
  }
}
