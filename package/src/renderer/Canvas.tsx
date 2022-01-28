import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
  forwardRef,
} from "react";
import type {
  RefObject,
  ReactNode,
  ComponentProps,
  Context,
  ReactElement,
} from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import { SkiaView, useDrawCallback } from "../views";
import type { TouchHandler } from "../views";
import { Skia } from "../skia";
import type { FontMgr } from "../skia/FontMgr/FontMgr";

import { debug as hostDebug, skHostConfig } from "./HostConfig";
import { CanvasNode } from "./nodes/Canvas";
// import { debugTree } from "./nodes";
import { vec } from "./processors";
import { popDrawingContext, pushDrawingContext } from "./CanvasProvider";
import type { DrawingContext } from "./DrawingContext";

// useContextBridge() is taken from https://github.com/pmndrs/drei#usecontextbridge
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useContextBridge = (...contexts: Context<any>[]) => {
  const values =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contexts.map((context) => useContext(context));
  return useMemo(
    () =>
      ({ children }: { children: ReactNode }) =>
        contexts.reduceRight(
          (acc, Context, i) => (
            <Context.Provider value={values[i]} children={acc} />
          ),
          children
        ) as ReactElement,
    [contexts, values]
  );
};

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

export interface CanvasProps extends ComponentProps<typeof SkiaView> {
  ref?: RefObject<SkiaView>;
  children: ReactNode;
  onTouch?: TouchHandler;
  fontMgr?: FontMgr;
}

export const Canvas = forwardRef<SkiaView, CanvasProps>(
  ({ children, style, debug, mode, onTouch, fontMgr }, ref) => {
    const [tick, setTick] = useState(0);
    const redraw = useCallback(() => setTick((t) => t + 1), []);
    const tree = useMemo(() => CanvasNode(redraw), [redraw]);
    const container = useMemo(
      () => skiaReconciler.createContainer(tree, 0, false, null),
      [tree]
    );

    // Render effect
    useEffect(() => {
      render(children, container, redraw);
    }, [children, container, redraw]);

    // Draw callback
    const onDraw = useDrawCallback(
      (canvas, info) => {
        // TODO: if tree is empty (count === 1) maybe we should not render?
        const { width, height, timestamp } = info;
        onTouch && onTouch(info.touches);
        const paint = Skia.Paint();
        paint.setAntiAlias(true);
        const ctx: DrawingContext = {
          canvas,
          paint,
          opacity: 1,
          width,
          height,
          timestamp,
          skiaRef: ref,
          getTouches: () => info.touches,
          center: vec(width / 2, height / 2),
          fontMgr: fontMgr ?? Skia.FontMgr.RefDefault(),
        };
        pushDrawingContext(ctx);
        tree.draw(ctx, tree.props, tree.children);
        popDrawingContext();
      },
      [tick, onTouch]
    );
    return (
      <SkiaView
        ref={ref}
        style={style}
        onDraw={onDraw}
        mode={mode}
        debug={debug}
      />
    );
  }
);
