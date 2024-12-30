import type { ReactNode } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import { skHostConfig, debug as hostDebug } from "./HostConfig";
import { Container } from "./Container";

const skiaReconciler = ReactReconciler(skHostConfig);

skiaReconciler.injectIntoDevTools({
  bundleType: 1,
  version: "0.0.1",
  rendererPackageName: "react-native-skia",
});

export class SkiaRoot {
  private root: OpaqueRoot;
  private container: Container;

  constructor(
    redraw: () => void = () => {},
    getNativeId: () => number = () => 0
  ) {
    this.container = new Container(redraw, getNativeId);
    this.root = skiaReconciler.createContainer(
      this.container,
      0,
      null,
      true,
      null,
      "",
      console.error,
      null
    );
  }

  render(element: ReactNode) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    skiaReconciler.updateContainer(element as any, this.root, null, () => {
      hostDebug("updateContainer");
    });
  }

  unmount() {
    this.container.unmounted = true;
    skiaReconciler.updateContainer(null, this.root, null, () => {
      hostDebug("unmountContainer");
    });
  }

  get dom() {
    return this.container.root;
  }
}
