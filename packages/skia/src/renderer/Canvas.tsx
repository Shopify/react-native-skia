import type { FC } from "react";
import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { View, ViewProps } from "react-native";
import { type SharedValue } from "react-native-reanimated";

import { SkiaViewNativeId } from "../views/SkiaViewNativeId";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import type { SkImage, SkRect, SkSize } from "../skia/types";
import { SkiaSGRoot } from "../sksg/Reconciler";
import { Skia } from "../skia";

export interface CanvasRef extends FC<CanvasProps> {
  makeImageSnapshot(rect?: SkRect): SkImage;
  makeImageSnapshotAsync(rect?: SkRect): Promise<SkImage>;
  redraw(): void;
  getNativeId(): number;
  measure(callback: Parameters<View["measure"]>[0]): void;
  measureInWindow(callback: Parameters<View["measureInWindow"]>[0]): void;
}

export const useCanvasRef = () => useRef<CanvasRef>(null);

export interface CanvasProps extends ViewProps {
  debug?: boolean;
  opaque?: boolean;
  onSize?: SharedValue<SkSize>;
  colorSpace?: "p3" | "srgb";
  ref?: React.Ref<CanvasRef>;
}

export const Canvas = ({
  debug,
  opaque,
  children,
  onSize,
  colorSpace = "p3",
  ref,
  ...viewProps
}: CanvasProps) => {
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

  return (
    <SkiaPictureViewNativeComponent
      ref={viewRef}
      collapsable={false}
      nativeID={`${nativeId}`}
      debug={debug}
      opaque={opaque}
      colorSpace={colorSpace}
      {...viewProps}
    />
  );
};
