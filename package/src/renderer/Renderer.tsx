import { useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import { SkiaView, useDrawCallback } from "../views";
import { Skia } from "../skia";

import { debug, skHostConfig } from "./HostConfig";
import { CanvasNode } from "./nodes/Canvas";
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

interface CanvasProps {
  children: ReactNode;
}

export const Canvas = ({ children }: CanvasProps) => {
  const [tick, setTick] = useState(0);
  const redraw = useCallback(() => setTick((t) => t + 1), []);
  const tree = useMemo(() => CanvasNode(redraw), [redraw]);
  const container = useMemo(
    () => skiaReconciler.createContainer(tree, 0, false, null),
    [tree]
  );
  useEffect(() => {
    render(children, container, redraw);
  }, [children, container, redraw]);
  const onDraw = useDrawCallback(
    (canvas, { width, height }) => {
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      const ctx = { canvas, paint, opacity: 1, width, height };
      tree.draw(ctx, tree.props, tree.children);
    },
    [tick]
  );
  return <SkiaView onDraw={onDraw} />;
};
