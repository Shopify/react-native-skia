import React from "react";
import { RNSkiaTouchCallback } from "./types";

import { NativeSkiaView, RNSkiaDrawCallback, RNSkiaViewProps } from "./types";

let SkiaViewNativeId = 1000;

export class SkiaView extends React.Component<RNSkiaViewProps> {
  constructor(props: RNSkiaViewProps) {
    super(props);
    this._nativeId = `${SkiaViewNativeId++}`;
    const { onDraw, onTouch } = props;
    if (onDraw) {
      assertDrawCallbacksEnabled();
      setDrawCallback(this._nativeId, onDraw);
    }
    if (onTouch) {
      assertDrawCallbacksEnabled();
      setTouchCallback(this._nativeId, onTouch);
    }
  }

  private _nativeId: string;

  componentDidUpdate(prevProps: RNSkiaViewProps) {
    const { onDraw, onTouch } = this.props;
    if (onDraw !== prevProps.onDraw) {
      assertDrawCallbacksEnabled();
      if (prevProps.onDraw) {
        setDrawCallback(this._nativeId, undefined);
      }
      if (onDraw) {
        setDrawCallback(this._nativeId, onDraw);
      }
    }

    if (onTouch !== prevProps.onTouch) {
      assertDrawCallbacksEnabled();
      if (prevProps.onTouch) {
        setTouchCallback(this._nativeId, undefined);
      }
      if (onTouch) {
        setTouchCallback(this._nativeId, onTouch);
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

const setTouchCallback = (
  nativeId: string,
  drawCallback: RNSkiaTouchCallback | undefined
) => {
  return SkiaViewApi.setTouchCallback(parseInt(nativeId, 10), drawCallback);
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