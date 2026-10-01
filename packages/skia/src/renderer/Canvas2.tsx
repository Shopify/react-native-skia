import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { View } from "react-native";

import Rea from "../external/reanimated/ReanimatedProxy";
import { SkiaViewNativeId } from "../views/SkiaViewNativeId";
import SkiaGraphiteViewNativeComponent from "../specs/SkiaGraphiteViewNativeComponent";
import type { SkRect } from "../skia/types";
import { SkiaSGRoot } from "../sksg/Reconciler";
import { Skia } from "../skia";
import { Platform } from "../Platform";
import { HAS_REANIMATED_3 } from "../external";

import type { CanvasProps, CanvasRef } from "./Canvas";

const useReanimatedFrame = !HAS_REANIMATED_3 ? () => {} : Rea.useFrameCallback;
const measure = !HAS_REANIMATED_3 ? null : Rea.measure;

const useCanvasRefPriv: typeof useRef<View> = !HAS_REANIMATED_3
  ? useRef
  : Rea.useAnimatedRef;

/**
 * The declarative canvas on the Graphite view. It takes the same props and
 * exposes the same ref as {@link Canvas}, and draws the same children, but
 * the frames are produced differently:
 *
 * - the JS thread records the scene graph into a native recorder once per
 *   React commit and hands it to the view;
 * - the Reanimated UI runtime only reads the shared values into it (the one
 *   step that needs a JS runtime), it never replays anything;
 * - a dedicated native thread pool replays the recorder into a Graphite
 *   recording whenever the content changed, at most once per presented frame;
 * - the view presents the recording on the next vsync.
 *
 * Neither the JS thread nor the UI thread pays for drawing. It requires the
 * Graphite backend (install-skia-graphite); with the default backend the view
 * renders nothing. `colorSpace`, `android` and `androidWarmup` are accepted
 * for API compatibility and ignored: the Graphite view renders in sRGB and
 * uses its own backing view.
 */
export const Canvas2 = ({
  debug,
  opaque,
  children,
  onSize,

  colorSpace,
  highBitDepth = false,

  androidWarmup,

  android,
  ref,
  onLayout,
  ...viewProps
}: CanvasProps) => {
  if (onLayout && Platform.OS !== "web") {
    console.error(
      "<Canvas2 onLayout={onLayout} /> is not supported on the new architecture, to fix the issue, see: https://shopify.github.io/react-native-skia/docs/canvas/overview/#getting-the-canvas-size"
    );
  }
  const viewRef = useCanvasRefPriv(null);
  // Native ID
  const nativeId = useMemo(() => {
    return SkiaViewNativeId.current++;
  }, []);

  // Root
  const root = useMemo(() => new SkiaSGRoot(Skia, nativeId), [nativeId]);

  useReanimatedFrame(() => {
    "worklet";
    if (onSize && measure) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = measure(viewRef as any);
      if (result) {
        const { width, height } = result;
        if (onSize.value.width !== width || onSize.value.height !== height) {
          onSize.value = { width, height };
        }
      }
    }
  }, !!onSize);

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

  return (
    <SkiaGraphiteViewNativeComponent
      ref={viewRef}
      collapsable={false}
      nativeID={`${nativeId}`}
      debug={debug}
      opaque={opaque}
      highBitDepth={highBitDepth}
      onLayout={onLayout}
      {...viewProps}
    />
  );
};
