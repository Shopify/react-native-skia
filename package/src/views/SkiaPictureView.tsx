import React from "react";

import type { SkRect } from "../skia/types";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";

import { SkiaViewApi } from "./api";
import type { SkiaPictureViewProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

const NativeSkiaPictureView = SkiaPictureViewNativeComponent;

export class SkiaPictureView extends React.Component<SkiaPictureViewProps> {
  constructor(props: SkiaPictureViewProps) {
    super(props);
    this._nativeId = SkiaViewNativeId.current++;
    const { picture, onSize } = props;
    if (picture) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "picture", picture);
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

  componentDidUpdate(prevProps: SkiaPictureViewProps) {
    const { picture, onSize } = this.props;
    if (picture !== prevProps.picture) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "picture", picture);
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
    SkiaViewApi.requestRedraw(this._nativeId);
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <NativeSkiaPictureView
        collapsable={false}
        nativeID={`${this._nativeId}`}
        mode={mode ?? "default"}
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
