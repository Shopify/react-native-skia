import React from "react";
import type { HostComponent } from "react-native";

import type { Skia, SkRect } from "../skia/types";
import { Platform } from "../Platform";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import { JsiDrawingContext } from "../dom/types";

import { SkiaViewApi } from "./api";
import type { SkiaPictureViewProps, SkiaDomViewProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

const NativeSkiaPictureView: HostComponent<SkiaPictureViewProps> =
  Platform.OS !== "web"
    ? SkiaPictureViewNativeComponent
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (null as any);

export class SkiaJSDomView extends React.Component<
  SkiaDomViewProps & { Skia: Skia }
> {
  constructor(props: SkiaDomViewProps & { Skia: Skia }) {
    super(props);
    this._nativeId = SkiaViewNativeId.current++;
    const { root, onTouch, onSize } = props;
    if (root) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "root", root);
    }
    if (onTouch) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onTouch", onTouch);
    }
    if (onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
  }

  private _nativeId: number;

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaDomViewProps & { Skia: Skia }) {
    const { root, onTouch, onSize } = this.props;
    if (root !== prevProps.root && root !== undefined) {
      assertSkiaViewApi();
      this.draw();
    }
    if (onTouch !== prevProps.onTouch) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onTouch", onTouch);
    }
    if (onSize !== prevProps.onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
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

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertSkiaViewApi();
    this.draw();
    //SkiaViewApi.requestRedraw(this._nativeId);
  }

  private draw() {
    const { root, Skia } = this.props;
    if (root !== undefined) {
      assertSkiaViewApi();
      const rec = Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      const ctx = new JsiDrawingContext(Skia, canvas);
      root.render(ctx);
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
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <NativeSkiaPictureView
        collapsable={false}
        nativeID={`${this._nativeId}`}
        mode={mode}
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
    SkiaViewApi.callJsiMethod === null ||
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error("Skia View Api was not found.");
  }
};
