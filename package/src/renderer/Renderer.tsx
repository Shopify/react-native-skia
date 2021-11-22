import { useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import { SkiaView } from "../views/SkiaView";
import { useDrawCallback } from "..";

import { debug, skHostConfig } from "./HostConfig";
import { CanvasNode } from "./nodes/Canvas";
import { useCanvasKit } from "./CanvasKitProvider";
// import { debugTree } from "./nodes";

export const skiaReconciler = ReactReconciler(skHostConfig);

skiaReconciler.injectIntoDevTools({
  bundleType: 1,
  version: "0.0.1",
  rendererPackageName: "react-native-skia",
});

const render = (
  element: ReactNode,
  container: OpaqueRoot,
  update: () => void
) => {
  skiaReconciler.updateContainer(element, container, null, () => {
    debug("updateContainer");
    update();
  });
};

interface SkiaProps {
  children: ReactNode;
}

export const Skia = ({ children }: SkiaProps) => {
  const [tick, setTick] = useState(0);
  const redraw = useCallback(() => setTick((t) => t + 1), []);
  const CanvasKit = useCanvasKit();
  const tree = useMemo(
    () => CanvasNode(CanvasKit, redraw),
    [CanvasKit, redraw]
  );
  const container = useMemo(
    () => skiaReconciler.createContainer(tree, 0, false, null),
    [tree]
  );
  useEffect(() => {
    render(children, container, redraw);
  }, [CanvasKit, children, container, redraw]);
  const onDraw = useDrawCallback(
    (_, canvas) => {
      const paint = new CanvasKit.Paint();
      paint.setAntiAlias(true);
      const ctx = { CanvasKit, canvas, paint, opacity: 1 };
      tree.draw(ctx, tree.props, tree.children);
    },
    [tick]
  );
  return <SkiaView onDraw={onDraw} />;
};
