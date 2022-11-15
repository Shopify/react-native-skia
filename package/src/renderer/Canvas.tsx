import React, {
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useRef,
  useState,
} from "react";
import type {
  RefObject,
  ReactNode,
  ComponentProps,
  MutableRefObject,
  ForwardedRef,
} from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";
import { Platform } from "react-native";

import { SkiaDomView } from "../views";
import type { TouchHandler } from "../views";
import { Skia } from "../skia/Skia";
import type { SkiaValue } from "../values";

import { debug as hostDebug, skHostConfig } from "./HostConfig";
// import { debugTree } from "./nodes";
import { Container } from "./Container";
import { DependencyManager } from "./DependencyManager";

export const skiaReconciler = ReactReconciler(skHostConfig);

skiaReconciler.injectIntoDevTools({
  bundleType: 1,
  version: "0.0.1",
  rendererPackageName: "react-native-skia",
});

const render = (element: ReactNode, root: OpaqueRoot, container: Container) => {
  skiaReconciler.updateContainer(element, root, null, () => {
    hostDebug("updateContainer");
    container.depMgr.update();
  });
};

export const useCanvasRef = () => useRef<SkiaDomView>(null);

const createDependencyManager = (
  registerValues: (values: Array<SkiaValue<unknown>>) => () => void
) =>
  global.SkiaDomApi && global.SkiaDomApi.DependencyManager
    ? global.SkiaDomApi.DependencyManager(registerValues)
    : new DependencyManager(registerValues);

export interface CanvasProps extends ComponentProps<typeof SkiaDomView> {
  ref?: RefObject<SkiaDomView>;
  children: ReactNode;
  onTouch?: TouchHandler;
}

export const Canvas = forwardRef<SkiaDomView, CanvasProps>(
  ({ children, style, debug, mode, onTouch, onSize }, forwardedRef) => {
    const innerRef = useCanvasRef();
    const ref = useCombinedRefs(forwardedRef, innerRef);
    const [, setTick] = useState(0);
    const redraw = useCallback(() => {
      Platform.OS === "web"
        ? setTick((tick) => tick + 1)
        : innerRef.current?.redraw();
    }, [innerRef]);

    const registerValues = useCallback(
      (values: Array<SkiaValue<unknown>>) => {
        if (ref.current === null) {
          throw new Error("Canvas ref is not set");
        }
        return ref.current.registerValues(values);
      },
      [ref]
    );

    const container = useMemo(() => {
      return new Container(
        Skia,
        createDependencyManager(registerValues),
        redraw
      );
    }, [redraw, registerValues]);

    const root = useMemo(
      () =>
        skiaReconciler.createContainer(
          container,
          0,
          null,
          true,
          null,
          "",
          console.error,
          null
        ),
      [container]
    );

    // Render effect
    useEffect(() => {
      render(children, root, container);
    }, [children, root, redraw, container]);

    useEffect(() => {
      return () => {
        skiaReconciler.updateContainer(null, root, null, () => {
          container.depMgr.remove();
        });
      };
    }, [container, root]);

    return (
      <SkiaDomView
        ref={ref}
        style={style}
        root={container.root}
        onTouch={onTouch}
        onSize={onSize}
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
