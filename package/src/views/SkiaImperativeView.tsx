import React from "react";

import type { SkRect } from "../skia/types";
import SkiaImperativeViewNativeComponent from "../specs/SkiaImperativeViewNativeComponent";

import { SkiaViewApi } from "./api";
import type { SkiaBaseViewProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

const NativeSkiaImperativeView = SkiaImperativeViewNativeComponent;

export class SkiaImperativeView extends React.Component<SkiaBaseViewProps> {
  constructor(props: SkiaBaseViewProps) {
    super(props);
    this._nativeId = SkiaViewNativeId.current++;
    const { onSize } = props;

    if (onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
  }

  private _nativeId: number;

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaBaseViewProps) {
    const { onSize } = this.props;

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
      <NativeSkiaImperativeView
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
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error("Skia View Api was not found.");
  }
};
