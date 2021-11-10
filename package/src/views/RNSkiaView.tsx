import React, { useRef, useEffect } from "react";
import type { NativeMethods, ViewProps } from "react-native";
import { View, StyleSheet, requireNativeComponent } from "react-native";

import type { Canvas, Info } from "../skia/Canvas";

type NativeSkiaViewProps = ViewProps & {
  mode?: "continuous" | "default";
  debug?: boolean;
};

export type RNSkiaDrawCallback = (canvas: Canvas, info: Info) => void;

const NativeSkiaView = requireNativeComponent<NativeSkiaViewProps>(
  "ReactNativeSkiaView"
);

type RNSkiaViewProps = ViewProps & {
  mode?: "continuous" | "default";
  debug?: boolean;
  onDraw?: RNSkiaDrawCallback;
};

type RefType = React.Component<NativeSkiaViewProps> & Readonly<NativeMethods>;

let SkiaViewNativeId = 1000;

export const RNSkiaView: React.FC<RNSkiaViewProps> = ({
  style,
  debug = __DEV__,
  mode = "default",
  onDraw,
}) => {
  const ref = useRef<RefType>(null);
  const nativeId = useRef<string>(`${SkiaViewNativeId++}`);
  const previousProcessor = useRef<
    ((canvas: Canvas, info: Info) => void) | undefined
  >(onDraw);

  useEffect(() => {
    assertDrawCallbacksEnabled();

    if (previousProcessor.current) {
      unsetDrawCallback(nativeId.current);
      previousProcessor.current = undefined;
    }

    if (!onDraw) {
      return;
    }

    if ("__nativeId" in onDraw) {
      throw Error(
        "A single draw callback can only be consumed by a single view (for now)."
      );
    }

    Object.defineProperty(onDraw, "__nativeId", {
      value: nativeId.current,
    });

    setDrawCallback(nativeId.current, onDraw);
    previousProcessor.current = onDraw;

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onDraw.__nativeId = undefined;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      previousProcessor.current && unsetDrawCallback(nativeId.current);
      previousProcessor.current = undefined;
    };
  }, [onDraw]);

  return (
    <View style={style}>
      <NativeSkiaView
        nativeID={nativeId.current}
        ref={ref}
        style={StyleSheet.absoluteFill}
        mode={mode}
        debug={debug}
      />
    </View>
  );
};

declare global {
  var invalidateSkiaView: (nativeId: number) => void;
  var setDrawCallback: (nativeId: number, callback: RNSkiaDrawCallback) => void;
  var unsetDrawCallback: (nativeId: number) => void;
}

const setDrawCallback = (
  nativeId: string,
  drawCallback: RNSkiaDrawCallback
) => {
  return global.setDrawCallback(parseInt(nativeId, 10), drawCallback);
};

const unsetDrawCallback = (nativeId: string) => {
  global.unsetDrawCallback(parseInt(nativeId, 10));
};

const assertDrawCallbacksEnabled = () => {
  if (global.setDrawCallback == null || global.unsetDrawCallback == null) {
    throw Error("Draw Processors are not enabled.");
  }
};
