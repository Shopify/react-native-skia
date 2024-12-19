import React from "react";
import type { HostComponent } from "react-native";

import type { Skia, SkRect } from "../skia/types";
import { Platform } from "../Platform";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import { DrawingContext } from "../sksg/DrawingContext";
import type { SkiaSGRoot } from "../sksg/Reconciler";

import { SkiaViewApi } from "./api";
import type { SkiaBaseViewProps, SkiaPictureViewNativeProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

const NativeSkiaPictureView: HostComponent<SkiaPictureViewNativeProps> =
  Platform.OS !== "web"
    ? SkiaPictureViewNativeComponent
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (null as any);

interface SkiaSGViewProps extends SkiaBaseViewProps {
  Skia: Skia;
  root: SkiaSGRoot;
}

export class SkiaSGView extends React.Component<SkiaSGViewProps> {
  constructor(props: SkiaSGViewProps) {
    super(props);
    this._nativeId = SkiaViewNativeId.current++;
    const { root, onSize } = props;
    if (root) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "root", root);
    }
    if (onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    this.tick();
  }

  private _nativeId: number;
  private requestId = 0;

  private tick() {
    this.redraw();
    this.requestId = requestAnimationFrame(this.tick.bind(this));
  }

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaSGViewProps & { Skia: Skia }) {
    const { root, onSize } = this.props;
    if (root !== prevProps.root && root !== undefined) {
      assertSkiaViewApi();
      this.draw();
    }
    if (onSize !== prevProps.onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    this.tick();
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    assertSkiaViewApi();
    return SkiaViewApi.makeImageSnapshot(this._nativeId, rect);
  }

  public makeImageSnapshotAsync(rect?: SkRect) {
    assertSkiaViewApi();
    return SkiaViewApi.makeImageSnapshotAsync(this._nativeId, rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertSkiaViewApi();
    this.draw();
  }

  private draw() {
    const { root, Skia } = this.props;
    if (root !== undefined) {
      assertSkiaViewApi();
      const rec = Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      const ctx = new DrawingContext(Skia, canvas);
      root.draw(ctx);
      const picture = rec.finishRecordingAsPicture();
      SkiaViewApi.setJsiProperty(this._nativeId, "picture", picture);
    }
  }

  /**
   * Clear up the dom node when unmounting to release resources.
   */
  componentWillUnmount(): void {
    assertSkiaViewApi();
    SkiaViewApi.setJsiProperty(this._nativeId, "picture", null);
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }

  render() {
    const { debug = false, ...viewProps } = this.props;
    return (
      <NativeSkiaPictureView
        collapsable={false}
        nativeID={`${this._nativeId}`}
        debug={debug}
        {...viewProps}
      />
    );
  }
}

const assertSkiaViewApi = () => {
  if (
    SkiaViewApi === null ||
    SkiaViewApi.setJsiProperty === null ||
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error("Skia View Api was not found.");
  }
};
