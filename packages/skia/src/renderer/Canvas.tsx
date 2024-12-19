import React, {
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useRef,
} from "react";
import type {
  RefObject,
  ReactNode,
  MutableRefObject,
  ForwardedRef,
  FunctionComponent,
} from "react";
import type { LayoutChangeEvent } from "react-native";

import { SkiaDomView } from "../views";
import { Skia } from "../skia/Skia";
import type { SkiaBaseViewProps } from "../views";
import { SkiaJSDomView } from "../views/SkiaJSDomView";
import { SkiaSGRoot } from "../sksg/Reconciler";
import { SkiaSGView } from "../views/SkiaSGView";

import { SkiaRoot } from "./Reconciler";
import { NATIVE_DOM } from "./HostComponents";

export const useCanvasRef = () => useRef<SkiaDomView>(null);

export interface CanvasProps extends SkiaBaseViewProps {
  ref?: RefObject<SkiaDomView>;
  children: ReactNode;
  mode?: "default" | "continuous";
  experimental?: boolean;
}

const useOnSizeEvent = (
  resultValue: SkiaBaseViewProps["onSize"],
  onLayout?: (event: LayoutChangeEvent) => void
) => {
  return useCallback(
    (event: LayoutChangeEvent) => {
      if (onLayout) {
        onLayout(event);
      }
      const { width, height } = event.nativeEvent.layout;

      if (resultValue) {
        resultValue.value = { width, height };
      }
    },
    [onLayout, resultValue]
  );
};

export const Canvas = forwardRef<SkiaDomView, CanvasProps>(
  (
    {
      children,
      style,
      debug,
      mode = "default",
      onSize: _onSize,
      onLayout: _onLayout,
      experimental,
      ...props
    },
    forwardedRef
  ) => {
    const onLayout = useOnSizeEvent(_onSize, _onLayout);
    const innerRef = useCanvasRef();
    const ref = useCombinedRefs(forwardedRef, innerRef);
    const redraw = useCallback(() => {
      innerRef.current?.redraw();
    }, [innerRef]);
    const getNativeId = useCallback(() => {
      const id = innerRef.current?.nativeId ?? -1;
      return id;
    }, [innerRef]);

    const root = useMemo(
      () =>
        !experimental
          ? new SkiaRoot(Skia, NATIVE_DOM, redraw, getNativeId)
          : null,
      [experimental, redraw, getNativeId]
    );

    const sksgRoot = useMemo(
      () => (experimental ? new SkiaSGRoot() : null),
      [experimental]
    );

    // Render effect
    useEffect(() => {
      if (sksgRoot) {
        sksgRoot.render(children);
      } else {
        root!.render(children);
      }
    }, [children, root, redraw, sksgRoot]);

    useEffect(() => {
      return () => {
        if (sksgRoot) {
          sksgRoot.unmount();
        } else {
          root!.unmount();
        }
      };
    }, [root, sksgRoot]);
    if (sksgRoot) {
      return (
        <SkiaSGView
          Skia={Skia}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          style={style}
          root={sksgRoot}
          onLayout={onLayout}
          debug={debug}
          {...props}
        />
      );
    } else if (NATIVE_DOM) {
      return (
        <SkiaDomView
          ref={ref}
          style={style}
          root={root!.dom}
          onLayout={onLayout}
          debug={debug}
          mode={mode}
          {...props}
        />
      );
    } else {
      return (
        <SkiaJSDomView
          Skia={Skia}
          mode={mode}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          style={style}
          root={root!.dom}
          onLayout={onLayout}
          debug={debug}
          {...props}
        />
      );
    }
  }
) as FunctionComponent<CanvasProps & React.RefAttributes<SkiaDomView>>;

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
