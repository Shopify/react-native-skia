import React from "react";
import type { HostComponent } from "react-native";

import type { Skia, SkRect } from "../skia/types";
import { Platform } from "../Platform";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
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
    const { onSize } = props;
    if (onSize) {
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    this.redraw();
  }

  private _nativeId: number;

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaSGViewProps) {
    const { onSize } = this.props;
    if (onSize !== prevProps.onSize) {
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    this.redraw();
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshot(rect?: SkRect) {
    return SkiaViewApi.makeImageSnapshot(this._nativeId, rect);
  }

  public makeImageSnapshotAsync(rect?: SkRect) {
    return SkiaViewApi.makeImageSnapshotAsync(this._nativeId, rect);
  }

  public redraw() {
    SkiaViewApi.requestRedraw(this._nativeId);
  }

  componentWillUnmount() {
    SkiaViewApi.setJsiProperty(this._nativeId, "picture", null);
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
