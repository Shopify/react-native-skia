import type { ReactNode } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import type { Skia } from "../skia/types";
import type { SkiaValue } from "../values/types";

import { DependencyManager } from "./DependencyManager";
import { skHostConfig, debug as hostDebug } from "./HostConfig";
import { Container } from "./Container";
import { NATIVE_DOM } from "./HostComponents";

const skiaReconciler = ReactReconciler(skHostConfig);

type RegisterValues = (values: Array<SkiaValue<unknown>>) => () => void;

const createDependencyManager = (registerValues: RegisterValues) =>
  NATIVE_DOM
    ? global.SkiaDomApi.DependencyManager(registerValues)
    : new DependencyManager(registerValues);

skiaReconciler.injectIntoDevTools({
  bundleType: 1,
  version: "0.0.1",
  rendererPackageName: "react-native-skia",
});

export class SkiaRoot {
  private root: OpaqueRoot;
  private container: Container;

  constructor(
    Skia: Skia,
    registerValues: RegisterValues = () => () => {},
    redraw: () => void = () => {},
    getNativeId: () => number = () => 0
  ) {
    const depMgr = createDependencyManager(registerValues);
    this.container = new Container(Skia, depMgr, redraw, getNativeId);
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
    skiaReconciler.updateContainer(element, this.root, null, () => {
      hostDebug("updateContainer");
    });
  }

  unmount() {
    skiaReconciler.updateContainer(null, this.root, null, () => {
      this.container.depMgr.remove();
    });
  }

  get dom() {
    return this.container.root;
  }
}
