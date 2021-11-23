/* global SkiaViewApi:false */

import React from "react";

import { NativeSkiaView } from "./types";
import type { RNSkiaDrawCallback, RNSkiaViewProps } from "./types";

let SkiaViewNativeId = 1000;

export class SkiaView extends React.Component<RNSkiaViewProps> {
  constructor(props: RNSkiaViewProps) {
    super(props);
    this._nativeId = `${SkiaViewNativeId++}`;
    const { onDraw } = props;
    if (onDraw) {
      assertDrawCallbacksEnabled();
      setDrawCallback(this._nativeId, onDraw);
    }
  }

  private _nativeId: string;

  componentDidUpdate(prevProps: RNSkiaViewProps) {
    const { onDraw } = this.props;
    if (onDraw !== prevProps.onDraw) {
      assertDrawCallbacksEnabled();
      if (prevProps.onDraw) {
        setDrawCallback(this._nativeId, undefined);
      }
      if (onDraw) {
        setDrawCallback(this._nativeId, onDraw);
      }
    }
  }

  public redraw() {
    assertDrawCallbacksEnabled();
    invalidateSkiaView(this._nativeId);
  }

  render() {
    const { style, mode, debug = __DEV__ ? true : false } = this.props;
    return (
      <NativeSkiaView
        style={style}
        collapsable={false}
        nativeID={this._nativeId}
        mode={mode}
        debug={debug}
      />
    );
  }
}

const setDrawCallback = (
  nativeId: string,
  drawCallback: RNSkiaDrawCallback | undefined
) => {
  return SkiaViewApi.setDrawCallback(parseInt(nativeId, 10), drawCallback);
};

const invalidateSkiaView = (nativeId: string) => {
  SkiaViewApi.invalidateSkiaView(parseInt(nativeId, 10));
};

const assertDrawCallbacksEnabled = () => {
  if (
    SkiaViewApi === null ||
    SkiaViewApi.setDrawCallback == null ||
    SkiaViewApi.invalidateSkiaView == null
  ) {
    throw Error("Skia Api is not enabled.");
  }
};
