import type { ReactNode, RefObject } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import type { Skia } from "../skia/types";
import type { SkiaValue } from "../values/types";
import type { SkiaDomView } from "../views";

import { DependencyManager } from "./DependencyManager";
import { skHostConfig, debug as hostDebug } from "./HostConfig";
import { Container } from "./Container";
import type { DrawingContext } from "./DrawingContext";

const skiaReconciler = ReactReconciler(skHostConfig);

const createDependencyManager = (
  registerValues: (values: Array<SkiaValue<unknown>>) => () => void
) =>
  global.SkiaDomApi && global.SkiaDomApi.DependencyManager
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

  constructor(Skia: Skia, ref: RefObject<SkiaDomView>) {
    const registerValues = (values: Array<SkiaValue<unknown>>) => {
      if (ref.current === null) {
        throw new Error("Canvas ref is not set");
      }
      return ref.current.registerValues(values);
    };
    const depMgr = createDependencyManager(registerValues);
    this.container = new Container(Skia, depMgr);
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
      this.container.depMgr.update();
    });
  }

  unmount() {
    skiaReconciler.updateContainer(null, this.root, null, () => {
      this.container.depMgr.remove();
    });
  }

  draw(ctx: DrawingContext) {
    this.container.draw(ctx);
  }

  get dom() {
    return this.container.root;
  }
}
