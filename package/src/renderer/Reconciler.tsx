import type { ReactNode, RefObject } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import type { Skia } from "../skia/types";
import type { SkiaValue } from "../values/types";
import type { SkiaDomView } from "../views";
import { SkiaView } from "../views/SkiaView.web";

import { DependencyManager } from "./DependencyManager";
import { skHostConfig, debug as hostDebug } from "./HostConfig";
import { Container } from "./Container";

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

  constructor(
    Skia: Skia,
    ref: RefObject<SkiaDomView>,
    redraw: () => void = () => {}
  ) {
    const registerValues = (values: Array<SkiaValue<unknown>>) => {
      if (ref.current === null) {
        throw new Error("Canvas ref is not set");
      }
      return ref.current.registerValues(values);
    };
    const depMgr = createDependencyManager(registerValues, js);
    this.container = new Container(Skia, depMgr, redraw);
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

  get dom() {
    return this.container.root;
  }
}

export const getImageFromCPU = (
  width: number,
  height: number,
  node: ReactNode
) => {
  const Skia = global.SkiaApi;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = { current: new SkiaView({}) as any };
  const root = new SkiaRoot(Skia, ref, () => {});
  const surface = Skia.Surface.Make(width, height);
  if (!surface) {
    throw new Error("Failed to create surface");
  }
  const canvas = surface.getCanvas();
  const ctx = {
    width,
    height,
    timestamp: 0,
    canvas,
    paint: Skia.Paint(),
    ref,
    center: Skia.Point(width / 2, height / 2),
    Skia,
  };
  root.render(node);
  root.dom.render(ctx);
  const image = surface.makeImageSnapshot();
  root.unmount();
  return image;
};
