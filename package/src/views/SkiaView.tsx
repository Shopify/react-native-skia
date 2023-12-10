import React from "react";

import type { SkRect } from "../skia/types";
import type { SkiaValue } from "../values";
import SkiaDrawViewNativeComponent from "../specs/SkiaDrawViewNativeComponent";

import { SkiaViewApi } from "./api";
import type { SkiaDrawViewProps } from "./types";

export const SkiaViewNativeId = { current: 1000 };

const NativeSkiaView = SkiaDrawViewNativeComponent;

export class SkiaView extends React.Component<SkiaDrawViewProps> {
  constructor(props: SkiaDrawViewProps) {
    super(props);
    console.warn(
      `The SkiaView component is deprecated and will be removed in the next release.
If you are looking to use the Skia imperative API, you can use:
* The picture API: https://shopify.github.io/react-native-skia/docs/shapes/pictures/
* The offscreen API: http://localhost:3000/react-native-skia/docs/animations/textures`
    );
    this._nativeId = SkiaViewNativeId.current++;
    const { onDraw, onSize } = props;
    if (onDraw) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "drawCallback", onDraw);
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

  componentDidUpdate(prevProps: SkiaDrawViewProps) {
    const { onDraw, onSize } = this.props;
    if (onDraw !== prevProps.onDraw) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "drawCallback", onDraw);
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

  render() {
    const { mode, debug = false, onSize, ...viewProps } = this.props;
    return (
      <NativeSkiaView
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
    SkiaViewApi.registerValuesInView === null ||
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error("Skia View Api was not found.");
  }
};
