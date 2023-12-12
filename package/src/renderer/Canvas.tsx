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

import { SkiaDomView, SkiaPictureView } from "../views";
import { Skia } from "../skia/Skia";
import type { TouchHandler, SkiaBaseViewProps } from "../views";
import type { SkiaValue } from "../values/types";
import { JsiDrawingContext } from "../dom/types";

import { SkiaRoot } from "./Reconciler";
import { NATIVE_DOM } from "./HostComponents";
import { isValue } from "./processors";

export const useCanvasRef = () => useRef<SkiaDomView>(null);

export interface CanvasProps extends SkiaBaseViewProps {
  ref?: RefObject<SkiaDomView>;
  children: ReactNode;
  onTouch?: TouchHandler;
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

      if (isValue(resultValue)) {
        resultValue.current = { width, height };
      } else if (resultValue) {
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
      mode,
      onTouch,
      onSize: _onSize,
      onLayout: _onLayout,
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

    const registerValues = useCallback(
      (values: Array<SkiaValue<unknown>>) => {
        if (ref.current !== null) {
          return ref.current.registerValues(values);
        }
        return () => {};
      },
      [ref]
    );
    const root = useMemo(
      () => new SkiaRoot(Skia, registerValues, redraw, getNativeId),
      [redraw, registerValues, getNativeId]
    );

    // Render effect
    useEffect(() => {
      root.render(children);
    }, [children, root, redraw]);

    useEffect(() => {
      return () => {
        root.unmount();
      };
    }, [root]);
    if (NATIVE_DOM) {
      return (
        <SkiaDomView
          ref={ref}
          style={style}
          root={root.dom}
          onTouch={onTouch}
          onLayout={onLayout}
          mode={mode}
          debug={debug}
          {...props}
        />
      );
    } else {
      // This is for debugging
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording(
        Skia.XYWHRect(0, 0, 2_000_000, 2_000_000)
      );
      const ctx = new JsiDrawingContext(Skia, canvas);
      root.dom.render(ctx);
      const picture = recorder.finishRecordingAsPicture();
      return (
        <SkiaPictureView
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          style={style}
          mode={mode}
          debug={debug}
          picture={picture}
          onLayout={onLayout}
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
