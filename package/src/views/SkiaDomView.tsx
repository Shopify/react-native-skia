import React from "react";
import type { HostComponent } from "react-native";

import type { SkRect } from "../skia/types";
import type { SkiaValue } from "../values";
import { Platform } from "../Platform";

import { SkiaViewApi } from "./api";
import { SkiaViewNativeId } from "./SkiaView";
import type { NativeSkiaViewProps, SkiaDomViewProps } from "./types";

const NativeSkiaDomView: HostComponent<SkiaDomViewProps> =
  Platform.OS !== "web"
    ? Platform.requireNativeComponent<NativeSkiaViewProps>("SkiaDomView")
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (null as any);

export class SkiaDomView extends React.Component<SkiaDomViewProps> {
  constructor(props: SkiaDomViewProps) {
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

  componentDidUpdate(prevProps: SkiaDomViewProps) {
    const { root, onTouch, onSize } = this.props;
    if (root !== prevProps.root) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "root", root);
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
    SkiaViewApi.requestRedraw(this._nativeId);
  }

  /**
   * Registers one or move values as a dependant value of the Skia View. The view will
   * The view will redraw itself when any of the values change.
   * @param values Values to register
   */
  public registerValues(values: SkiaValue<unknown>[]): () => void {
    assertSkiaViewApi();
    return SkiaViewApi.registerValuesInView(this._nativeId, values);
  }

  /**
   * Clear up the dom node when unmounting to release resources.
   */
  componentWillUnmount(): void {
    assertSkiaViewApi();
    SkiaViewApi.setJsiProperty(this._nativeId, "root", null);
  }

  render() {
    const { mode, debug = false, ...viewProps } = this.props;
    return (
      <NativeSkiaDomView
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
    SkiaViewApi.registerValuesInView === null ||
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error("Skia View Api was not found.");
  }
};
