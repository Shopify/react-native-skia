import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import type { AndroidCanvasProps, AndroidSurfaceType } from "./types";

// Anything else reaching the native component would hit the generated
// string-enum parser, which aborts on unknown values.
const resolveSurfaceType = (
  surfaceType: AndroidSurfaceType | undefined
): "auto" | AndroidSurfaceType =>
  surfaceType === "SurfaceView" || surfaceType === "TextureView"
    ? surfaceType
    : "auto";

/** The native props the `android` prop of a view resolves to. */
export const androidNativeProps = (android?: AndroidCanvasProps) => ({
  androidSurfaceType: resolveSurfaceType(android?.surfaceType),
  androidZOrderOnTop: !!android?.zOrderOnTop,
});

/** The props the Android backing view is chosen from when a canvas mounts. */
export interface BackingViewProps {
  opaque?: boolean;
  highBitDepth?: boolean;
  android?: AndroidCanvasProps;
}

// The backing view the props select, see SkiaView.resolveKind().
const resolveKind = ({ opaque, android }: BackingViewProps) => {
  const surfaceType = resolveSurfaceType(android?.surfaceType);
  if (surfaceType !== "auto") {
    return surfaceType;
  }
  return opaque ? "SurfaceView" : "TextureView";
};

// Whether the canvas gets the 10-bit format, see
// SkiaView.resolveHighBitDepth().
const resolveHighBitDepth = (
  highBitDepth: boolean | undefined,
  kind: AndroidSurfaceType,
  opaque: boolean | undefined
) => !!highBitDepth && kind === "SurfaceView" && !!opaque;

const warn = (prop: string) =>
  console.warn(
    `Ignoring a change of ${prop} on a mounted canvas: the backing view is ` +
      "chosen when the canvas mounts. Remount the canvas (give it a new key) " +
      "to change it."
  );

/**
 * Warns, in development on Android, about a change of these props that the
 * native view ignores: the backing view is chosen from them when the canvas
 * mounts (see SkiaView.java, whose setters these rules mirror). The native
 * side only says so in logcat, which is not where a JS developer looks.
 */
export const warnBackingViewChange = (
  mount: BackingViewProps,
  prev: BackingViewProps,
  next: BackingViewProps
) => {
  if (!__DEV__ || Platform.OS !== "android") {
    return;
  }
  const kind = resolveKind(mount);
  if (
    resolveSurfaceType(prev.android?.surfaceType) !==
    resolveSurfaceType(next.android?.surfaceType)
  ) {
    warn("android.surfaceType");
  }
  // Only a SurfaceView has a z-order of its own, which Android 11 and later
  // changes in place.
  if (
    !!prev.android?.zOrderOnTop !== !!next.android?.zOrderOnTop &&
    kind === "SurfaceView" &&
    Number(Platform.Version) < 30
  ) {
    warn("android.zOrderOnTop");
  }
  // On a SurfaceView with highBitDepth, opaque selects the buffer format
  // along with it, and is read at mount like the format is; elsewhere it is
  // applied in place and the view has the previous value.
  const opaqueAtMount = kind === "SurfaceView" && !!mount.highBitDepth;
  const opaque = opaqueAtMount ? mount.opaque : prev.opaque;
  if (
    resolveHighBitDepth(prev.highBitDepth, kind, opaque) !==
    resolveHighBitDepth(next.highBitDepth, kind, opaque)
  ) {
    warn("highBitDepth");
  }
  if (opaqueAtMount && !!prev.opaque !== !!next.opaque) {
    warn("opaque (which selects the buffer format with highBitDepth)");
  }
};

/**
 * warnBackingViewChange() for a function component: compares the props of
 * each render with the previous one's, against the ones it mounted with.
 */
export const useBackingViewWarning = (props: BackingViewProps) => {
  const mount = useRef(props);
  const prev = useRef(props);
  useEffect(() => {
    warnBackingViewChange(mount.current, prev.current, props);
    prev.current = props;
  });
};
