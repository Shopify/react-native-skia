import type { FC, RefObject } from "react";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  LayoutChangeEvent,
  MeasureInWindowOnSuccessCallback,
  MeasureOnSuccessCallback,
  View,
  ViewProps,
} from "react-native";
import { type SharedValue } from "react-native-reanimated";

import { SkiaViewNativeId } from "../views/SkiaViewNativeId";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import type { SkImage, SkRect, SkSize } from "../skia/types";
import { SkiaSGRoot } from "../sksg/Reconciler";
import { Skia } from "../skia";
import { Platform } from "../Platform";

export interface CanvasRef extends FC<CanvasProps> {
  makeImageSnapshot(rect?: SkRect): SkImage;
  makeImageSnapshotAsync(rect?: SkRect): Promise<SkImage>;
  redraw(): void;
  getNativeId(): number;
  measure(callback: MeasureOnSuccessCallback): void;
  measureInWindow(callback: MeasureInWindowOnSuccessCallback): void;
}

export const useCanvasRef = () => useRef<CanvasRef>(null);

export const useCanvasSize = (userRef?: RefObject<CanvasRef | null>) => {
  const ourRef = useCanvasRef();
  const ref = userRef ?? ourRef;
  const [size, setSize] = useState<SkSize>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.measure((_x, _y, width, height) => {
        setSize({ width, height });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, size };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFabric = Boolean((global as any)?.nativeFabricUIManager);

export interface CanvasProps extends Omit<ViewProps, "onLayout"> {
  debug?: boolean;
  opaque?: boolean;
  onSize?: SharedValue<SkSize>;
  colorSpace?: "p3" | "srgb";
  ref?: React.Ref<CanvasRef>;
  __destroyWebGLContextAfterRender?: boolean;
}

export const Canvas = ({
  debug,
  opaque,
  children,
  onSize,
  colorSpace = "p3",
  ref,
  // Here know this is a type error but this is done on purpose to check it at runtime
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  onLayout,
  ...viewProps
}: CanvasProps) => {
  if (onLayout && isFabric) {
    console.error(
      // eslint-disable-next-line max-len
      "<Canvas onLayout={onLayout} /> is not supported on the new architecture, to fix the issue, see: https://shopify.github.io/react-native-skia/docs/canvas/overview/#getting-the-canvas-size"
    );
  }
  const viewRef = useRef<View>(null);
  // Native ID
  const nativeId = useMemo(() => {
    return SkiaViewNativeId.current++;
  }, []);

  // Root
  const root = useMemo(
    () => new SkiaSGRoot(Skia, nativeId, onSize),
    [nativeId, onSize]
  );

  // Render effects
  useLayoutEffect(() => {
    root.render(children);
  }, [children, root, nativeId]);

  useEffect(() => {
    return () => {
      root.unmount();
    };
  }, [root]);

  // Component methods
  useImperativeHandle(
    ref,
    () =>
      ({
        makeImageSnapshot: (rect?: SkRect) => {
          return SkiaViewApi.makeImageSnapshot(nativeId, rect);
        },
        makeImageSnapshotAsync: (rect?: SkRect) => {
          return SkiaViewApi.makeImageSnapshotAsync(nativeId, rect);
        },
        redraw: () => {
          SkiaViewApi.requestRedraw(nativeId);
        },
        getNativeId: () => {
          return nativeId;
        },
        measure: (callback) => {
          viewRef.current?.measure(callback);
        },
        measureInWindow: (callback) => {
          viewRef.current?.measureInWindow(callback);
        },
      } as CanvasRef)
  );

  const onLayoutWeb = useCallback(
    (e: LayoutChangeEvent) => {
      if (onLayout) {
        onLayout(e);
      }
      if (Platform.OS === "web" && onSize) {
        const { width, height } = e.nativeEvent.layout;
        onSize.value = { width, height };
      }
    },
    [onLayout, onSize]
  );

  return (
    <SkiaPictureViewNativeComponent
      ref={viewRef}
      collapsable={false}
      nativeID={`${nativeId}`}
      debug={debug}
      opaque={opaque}
      colorSpace={colorSpace}
      onLayout={onLayoutWeb}
      {...viewProps}
    />
  );
};
