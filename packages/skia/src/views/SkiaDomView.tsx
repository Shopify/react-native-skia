import React from "react";
import type { HostComponent } from "react-native";

import type { SkRect } from "../skia/types";
import { Platform } from "../Platform";
import SkiaDomViewNativeComponent from "../specs/SkiaDomViewNativeComponent";

import { SkiaViewApi } from "./api";
import type { SkiaDomViewNativeProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

const NativeSkiaDomView: HostComponent<SkiaDomViewNativeProps> =
  Platform.OS !== "web"
    ? SkiaDomViewNativeComponent
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (null as any);

interface SkiaDomViewProps extends SkiaDomViewNativeProps {
  mode?: "default" | "continuous";
}

export class SkiaDomView extends React.Component<SkiaDomViewProps> {
  constructor(props: SkiaDomViewProps) {
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

  public get nativeId() {
    return this._nativeId;
  }

  componentDidUpdate(prevProps: SkiaDomViewProps) {
    const { root, onSize } = this.props;
    if (root !== prevProps.root) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "root", root);
    }
    if (onSize !== prevProps.onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    if (onSize !== prevProps.onSize || root !== prevProps.root) {
      this.tick();
    }
  }

  componentWillUnmount(): void {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }

  private tick() {
    this.redraw();
    if (this.props.mode === "continuous") {
      this.requestId = requestAnimationFrame(this.tick.bind(this));
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
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  public makeImageSnapshotAsync(rect?: SkRect) {
    assertSkiaViewApi();
    return SkiaViewApi.makeImageSnapshotAsync(this._nativeId, rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertSkiaViewApi();
    SkiaViewApi.requestRedraw(this._nativeId);
  }

  render() {
    const { debug = false, opaque = false, ...viewProps } = this.props;
    return (
      <NativeSkiaDomView
        collapsable={false}
        nativeID={`${this._nativeId}`}
        debug={debug}
        opaque={opaque}
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
