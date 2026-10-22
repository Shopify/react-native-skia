import React from "react";

import type { SkRect } from "../skia/types";
import SkiaViewNativeComponent from "../specs/SkiaViewNativeComponent";

import { SkiaViewApi } from "./api";
import {
  androidNativeProps,
  warnBackingViewAtMount,
  warnBackingViewChange,
} from "./android";
import type { BackingViewProps } from "./android";
import type { SkiaPictureViewNativeProps, SkiaViewHandle } from "./types";

interface SkiaPictureViewProps extends SkiaPictureViewNativeProps {
  mode?: "default" | "continuous";
}

/**
 * A view showing a picture. The picture is handed to the native view, which
 * records it once (and again on every redraw) for its surface.
 */
export class SkiaPictureView extends React.Component<SkiaPictureViewProps> {
  private requestId = 0;

  constructor(props: SkiaPictureViewProps) {
    super(props);
    assertSkiaViewApi();
    this._nativeId = SkiaViewApi.allocateNativeId();
    this.mountProps = props;
    warnBackingViewAtMount(props);
  }

  private _nativeId: number;
  // What the Android backing view was chosen from, see warnBackingViewChange.
  private mountProps: BackingViewProps;
  // The handle of the native view, from mount to unmount (see
  // SkiaViewHandle). Made once mounted rather than in the constructor, which
  // React's StrictMode runs twice, keeping one instance.
  private handle: SkiaViewHandle | null = null;

  public get nativeId() {
    return this._nativeId;
  }

  componentDidMount() {
    this.handle = SkiaViewApi.makeViewHandle(this._nativeId);
    const { picture } = this.props;
    if (picture) {
      this.handle.setPicture(picture);
    }
    this.tick();
  }

  componentDidUpdate(prevProps: SkiaPictureViewProps) {
    warnBackingViewChange(this.mountProps, prevProps, this.props);
    const { picture } = this.props;
    if (picture !== prevProps.picture) {
      this.handle?.setPicture(picture ?? null);
    }
    this.tick();
  }

  componentWillUnmount() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
    this.handle?.dispose();
    this.handle = null;
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
   * Sends a redraw request to the native SkiaView.
   */
  public redraw() {
    assertSkiaViewApi();
    SkiaViewApi.requestRedraw(this._nativeId);
  }

  render() {
    const {
      mode: _mode,
      picture: _picture,
      highBitDepth = false,
      android,
      ...viewProps
    } = this.props;
    return (
      <SkiaViewNativeComponent
        collapsable={false}
        nativeID={`${this._nativeId}`}
        highBitDepth={highBitDepth}
        {...androidNativeProps({ highBitDepth, android })}
        {...viewProps}
      />
    );
  }
}

const assertSkiaViewApi = () => {
  if (
    SkiaViewApi === null ||
    SkiaViewApi.makeViewHandle === null ||
    SkiaViewApi.requestRedraw === null ||
    SkiaViewApi.makeImageSnapshot === null
  ) {
    throw Error("Skia View Api was not found.");
  }
};
