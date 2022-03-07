import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
  forwardRef,
  useRef,
} from "react";
import type {
  RefObject,
  ReactNode,
  ComponentProps,
  Context,
  ReactElement,
  MutableRefObject,
  ForwardedRef,
} from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import { SkiaView, useDrawCallback } from "../views";
import type { TouchHandler } from "../views";
import { Skia } from "../skia";
import type { FontMgr } from "../skia/FontMgr/FontMgr";

import { debug as hostDebug, skHostConfig } from "./HostConfig";
// import { debugTree } from "./nodes";
import { vec } from "./processors";
import { createDependencyManager } from "./DependecyManager";
import { Container } from "./Host";

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

interface CanvasContext {
  width: number;
  height: number;
}

const CanvasContext = React.createContext<CanvasContext | null>(null);

export const useCanvas = () => {
  const canvas = useContext(CanvasContext);
  if (!canvas) {
    throw new Error("Canvas context is not available");
  }
  return canvas;
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

export const useCanvasRef = () => useRef<SkiaView>(null);

export interface CanvasProps extends ComponentProps<typeof SkiaView> {
  ref?: RefObject<SkiaView>;
  children: ReactNode;
  onTouch?: TouchHandler;
  fontMgr?: FontMgr;
}

export const Canvas = forwardRef<SkiaView, CanvasProps>(
  ({ children, style, debug, mode, onTouch, fontMgr }, forwardedRef) => {
    const innerRef = useCanvasRef();
    const ref = useCombinedRefs(forwardedRef, innerRef);
    const [tick, setTick] = useState(0);
    const redraw = useCallback(() => setTick((t) => t + 1), []);

    const tree = useMemo(() => new Container(redraw), [redraw]);

    const canvasCtx = useRef({ width: 0, height: 0 });
    const container = useMemo(
      () => skiaReconciler.createContainer(tree, 0, false, null),
      [tree]
    );
    // Render effect
    useEffect(() => {
      render(
        <CanvasContext.Provider value={canvasCtx.current}>
          {children}
        </CanvasContext.Provider>,
        container,
        redraw
      );
    }, [children, container, redraw]);

    const depsManager = useMemo(() => createDependencyManager(ref), [ref]);

    // Draw callback
    const onDraw = useDrawCallback(
      (canvas, info) => {
        // TODO: if tree is empty (count === 1) maybe we should not render?
        const { width, height, timestamp } = info;
        canvasCtx.current.width = width;
        canvasCtx.current.height = height;
        onTouch && onTouch(info.touches);
        const paint = Skia.Paint();
        paint.setAntiAlias(true);
        const ctx = {
          width,
          height,
          timestamp,
          canvas,
          paint,
          opacity: 1,
          ref,
          center: vec(width / 2, height / 2),
          fontMgr: fontMgr ?? Skia.FontMgr.RefDefault(),
        };
        tree.draw(ctx);
      },
      [tick, onTouch]
    );

    // Handle value dependency registration of values to the underlying
    // SkiaView. Every time the tree changes (children), we will visit all
    // our children and register their dependencies.
    useEffect(() => {
      // Register all values in the current tree
      depsManager.visitChildren(tree);
      // Subscrube / return unsubscribe function
      depsManager.subscribe();
      return depsManager.unsubscribe;
    }, [depsManager, tree, children]);

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

/**
 * Combines a list of refs into a single ref. This can be used to provide
 * both a forwarded ref and an internal ref keeping the same functionality
 * on both of the refs.
 * @param refs Array of refs to combine
 * @returns A single ref that can be used in a ref prop.
 */
const useCombinedRefs = <T,>(
  ...refs: Array<MutableRefObject<T> | ForwardedRef<T>>
) => {
  const targetRef = React.useRef<T>(null);
  React.useEffect(() => {
    refs.forEach((ref) => {
      if (ref) {
        if (typeof ref === "function") {
          ref(targetRef.current);
        } else {
          ref.current = targetRef.current;
        }
      }
    });
  }, [refs]);
  return targetRef;
};
