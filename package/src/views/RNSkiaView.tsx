import React from "react";

import { NativeSkiaView, RNSkiaDrawCallback, RNSkiaViewProps } from "./types";

let SkiaViewNativeId = 1000;

export class RNSkiaView extends React.Component<RNSkiaViewProps> {
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
        unsetDrawCallback(this._nativeId);
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
    const { style, mode, debug } = this.props;
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
  drawCallback: RNSkiaDrawCallback
) => {
  return global.setDrawCallback(parseInt(nativeId, 10), drawCallback);
};

const unsetDrawCallback = (nativeId: string) => {
  global.unsetDrawCallback(parseInt(nativeId, 10));
};

const invalidateSkiaView = (nativeId: string) => {
  global.invalidateSkiaView(parseInt(nativeId, 10));
};

const assertDrawCallbacksEnabled = () => {
  if (global.setDrawCallback == null || global.unsetDrawCallback == null) {
    throw Error("Draw Processors are not enabled.");
  }
};
