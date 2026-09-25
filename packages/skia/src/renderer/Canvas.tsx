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
import type { SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import { SkiaViewNativeId } from "../views/SkiaViewNativeId";
import type { AndroidCanvasProps, AndroidSurfaceType } from "../views/types";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import type { SkImage, SkRect, SkSize } from "../skia/types";
import { SkiaSGRoot } from "../sksg/Reconciler";
import { Skia } from "../skia";
import { Platform } from "../Platform";
import { HAS_REANIMATED_3 } from "../external";

export interface CanvasRef extends FC<CanvasProps> {
  makeImageSnapshot(rect?: SkRect): SkImage;
  makeImageSnapshotAsync(rect?: SkRect): Promise<SkImage>;
  redraw(): void;
  getNativeId(): number;
  measure(callback: MeasureOnSuccessCallback): void;
  measureInWindow(callback: MeasureInWindowOnSuccessCallback): void;
}

export const useCanvasRef = () => useRef<CanvasRef>(null);

const useCanvasRefPriv: typeof useRef<View> = !HAS_REANIMATED_3
  ? useRef
  : Rea.useAnimatedRef;

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

export interface CanvasProps extends Omit<ViewProps, "onLayout"> {
  debug?: boolean;
  /** @deprecated Not supported on native. Use `onSize` or `useCanvasSize()` instead. */
  onLayout?: ViewProps["onLayout"];
  /**
   * Declares that the canvas covers every pixel of its bounds, so nothing
   * behind it needs to show through. On Android an opaque canvas is backed by
   * a `SurfaceView` by default, the cheapest path (see `android.surfaceType`).
   * Defaults to false.
   */
  opaque?: boolean;
  onSize?: SharedValue<SkSize>;
  colorSpace?: "p3" | "srgb";
  /**
   * Renders into a surface with more than 8 bits per channel (16-bit float on
   * iOS, 10-bit on Android) to avoid banding in subtle gradients. Colors are
   * identical to the default 8-bit surface, only with more precision (this is
   * about bit depth, not HDR). On Android the extra precision survives
   * composition only when combined with `opaque`, and the prop must be set
   * before the canvas is mounted.
   */
  highBitDepth?: boolean;
  /** Android-only rendering options. Ignored on iOS and web. */
  android?: AndroidCanvasProps;
  ref?: React.Ref<CanvasRef>;
  androidWarmup?: boolean;
  __destroyWebGLContextAfterRender?: boolean;
}

// Anything else reaching the native component would hit the generated
// string-enum parser, which aborts on unknown values.
const resolveSurfaceType = (
  surfaceType: AndroidSurfaceType | undefined
): "auto" | AndroidSurfaceType =>
  surfaceType === "SurfaceView" || surfaceType === "TextureView"
    ? surfaceType
    : "auto";

export const Canvas = ({
  debug,
  opaque,
  children,
  onSize,
  colorSpace = "p3",
  highBitDepth = false,
  androidWarmup = false,
  android,
  ref,
  onLayout,
  ...viewProps
}: CanvasProps) => {
  if (onLayout && Platform.OS !== "web") {
    console.error(
      "<Canvas onLayout={onLayout} /> is not supported on the new architecture, to fix the issue, see: https://shopify.github.io/react-native-skia/docs/canvas/overview/#getting-the-canvas-size"
    );
  }
  const viewRef = useCanvasRefPriv(null);
  // Native ID
  const nativeId = useMemo(() => {
    return SkiaViewNativeId.current++;
  }, []);

  // Root
  const root = useMemo(() => new SkiaSGRoot(Skia, nativeId), [nativeId]);

  // The size comes from the view's own layout event: a per-frame measure outlives the view until its effect cleanup and reports the transformed box.
  const layoutSize = useRef<SkSize | null>(null);
  useLayoutEffect(() => {
    if (onSize && layoutSize.current) {
      onSize.value = layoutSize.current;
    }
  }, [onSize]);

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
      }) as CanvasRef
  );

  const onLayoutWithSize = useCallback(
    (e: LayoutChangeEvent) => {
      if (onLayout) {
        onLayout(e);
      }
      const { width, height } = e.nativeEvent.layout;
      const previous = layoutSize.current;
      if (previous && previous.width === width && previous.height === height) {
        return;
      }
      layoutSize.current = { width, height };
      if (onSize) {
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
      highBitDepth={highBitDepth}
      androidWarmup={androidWarmup}
      androidSurfaceType={resolveSurfaceType(android?.surfaceType)}
      androidZOrderOnTop={!!android?.zOrderOnTop}
      onLayout={onLayoutWithSize}
      {...viewProps}
    />
  );
};
