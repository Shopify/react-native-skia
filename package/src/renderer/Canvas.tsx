import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { ReactNode, RefObject, ComponentProps } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import { SkiaView, useDrawCallback } from "../views";
import type { TouchHandler } from "../views";
import { Skia } from "../skia";

import { debug as hostDebug, skHostConfig } from "./HostConfig";
import { CanvasNode } from "./nodes/Canvas";
// import { debugTree } from "./nodes";
import { vec } from "./processors";
import { popDrawingContext, pushDrawingContext } from "./CanvasProvider";

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
    hostDebug("updateContainer");
    update();
  });
};

interface CanvasProps extends ComponentProps<typeof SkiaView> {
  innerRef?: RefObject<SkiaView>;
  children: ReactNode;
  onTouch?: TouchHandler;
}

export const Canvas = ({
  innerRef,
  children,
  style,
  debug,
  mode,
  onTouch,
}: CanvasProps) => {
  const [tick, setTick] = useState(0);
  const redraw = useCallback(() => setTick((t) => t + 1), []);
  const tree = useMemo(() => CanvasNode(redraw), [redraw]);
  const container = useMemo(
    () => skiaReconciler.createContainer(tree, 0, false, null),
    [tree]
  );
  // Handle ref if none is set
  const _ref = useRef<SkiaView>(null);
  const skiaRef = useMemo(() => innerRef || _ref, [innerRef]);

  // Render effect
  useEffect(() => {
    render(children, container, redraw);
  }, [children, container, redraw]);

  // Draw callback
  const onDraw = useDrawCallback(
    (canvas, info) => {
      const { width, height, timestamp } = info;
      onTouch && onTouch(info.touches);
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      const ctx = {
        canvas,
        paint,
        opacity: 1,
        width,
        height,
        timestamp,
        skiaRef,
        getTouches: () => info.touches,
        center: vec(width / 2, height / 2),
      };
      pushDrawingContext(ctx);
      tree.draw(ctx, tree.props, tree.children);
      popDrawingContext();
    },
    [tick, onTouch]
  );
  return (
    <SkiaView
      ref={skiaRef}
      style={style}
      onDraw={onDraw}
      mode={mode}
      debug={debug}
    />
  );
};
