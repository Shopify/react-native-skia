import { useEffect, useRef } from "react";

import { Platform } from "../Platform";
import type { NativeProps } from "../specs/SkiaViewNativeComponent";

import type { AndroidCanvasProps } from "./types";

/** The props the Android backing view is chosen from when a canvas mounts. */
export interface BackingViewProps {
  highBitDepth?: boolean;
  android?: AndroidCanvasProps;
}

type AndroidNativePropName =
  | "androidBackingView"
  | "androidOpaque"
  | "androidZOrderOnTop"
  | "androidZOrderMediaOverlay";

/** What the native component is handed for the `android` prop. */
export type AndroidNativeProps = {
  [Name in AndroidNativePropName]-?: NonNullable<NativeProps[Name]>;
};

const textureViewProps = (opaque: boolean): AndroidNativeProps => ({
  androidBackingView: "TextureView",
  androidOpaque: opaque,
  androidZOrderOnTop: false,
  androidZOrderMediaOverlay: false,
});

// A value a JavaScript caller can pass that no view takes would hit the
// generated string-enum parser, which aborts on unknown values: it gets the
// default view, while TypeScript still reports a view the switch misses.
const resolveUnknownBackingView = (_android: never): AndroidNativeProps =>
  textureViewProps(false);

/**
 * The native props the `android` prop resolves to: the view it names, the
 * opacity it asks for with the default of that view (a SurfaceView is opaque
 * unless asked otherwise, a TextureView translucent unless asked otherwise, a
 * HardwareBufferView always composites with alpha), and the z-order options
 * of a SurfaceView. The native view adds the opacity of the 10-bit format it
 * was created with (see BackingViewKind.resolveOpaque()).
 */
export const androidNativeProps = (
  android?: AndroidCanvasProps
): AndroidNativeProps => {
  switch (android?.backingView) {
    case "SurfaceView":
      return {
        androidBackingView: "SurfaceView",
        androidOpaque: android.opaque !== false,
        androidZOrderOnTop: !!android.zOrderOnTop,
        androidZOrderMediaOverlay: !!android.zOrderMediaOverlay,
      };
    case "HardwareBufferView":
      return {
        ...textureViewProps(false),
        androidBackingView: "HardwareBufferView",
      };
    case "TextureView":
    case undefined:
      return textureViewProps(android?.opaque === true);
    default:
      return resolveUnknownBackingView(android);
  }
};

// Whether the canvas gets the high bit depth format: on Android only on a
// SurfaceView (see BackingViewKind.resolveHighBitDepth()), elsewhere whenever
// it asks for it.
export const resolveHighBitDepth = ({
  highBitDepth,
  android,
}: BackingViewProps) =>
  !!highBitDepth &&
  (Platform.OS !== "android" || android?.backingView === "SurfaceView");

// The releases whose SurfaceView moves a mounted surface's z-order, see
// BackingViewKind.java, which also needs an app targeting Android 11 for
// zOrderOnTop.
const zOrderOnTopChangesInPlace = (version: number, mediaOverlay: boolean) =>
  version >= 30 && !(mediaOverlay && version === 33);
const zOrderMediaOverlayChangesInPlace = (version: number) => version >= 34;

const warnIgnoredChange = (prop: string) =>
  console.warn(
    `Ignoring a change of ${prop} on a mounted canvas: the backing view is ` +
      "chosen when the canvas mounts. Remount the canvas (give it a new key) " +
      "to change it."
  );

/**
 * Warns, in development on Android, about options a mounting canvas asks for
 * that the native view cannot honour (see BackingViewKind.java, whose rules
 * these mirror). The native side only says so in logcat, which is not where a
 * JS developer looks.
 */
export const warnBackingViewAtMount = ({
  highBitDepth,
  android,
}: BackingViewProps) => {
  if (!__DEV__ || Platform.OS !== "android") {
    return;
  }
  const { androidBackingView } = androidNativeProps(android);
  if (androidBackingView === "HardwareBufferView") {
    console.warn(
      "android.backingView: HardwareBufferView is not available in React " +
        "Native Skia yet, the canvas uses a TextureView."
    );
  }
  if (highBitDepth && androidBackingView !== "SurfaceView") {
    console.warn(
      "highBitDepth needs a SurfaceView on Android (android.backingView: " +
        '"SurfaceView"), the canvas keeps the 8-bit format.'
    );
  }
  if (
    androidBackingView !== "SurfaceView" &&
    (android?.zOrderOnTop || android?.zOrderMediaOverlay)
  ) {
    console.warn(
      "android.zOrderOnTop and android.zOrderMediaOverlay only apply to a " +
        'SurfaceView (android.backingView: "SurfaceView"), the canvas ignores ' +
        "them."
    );
  }
  if (
    highBitDepth &&
    androidBackingView === "SurfaceView" &&
    android?.opaque === false
  ) {
    console.warn(
      "Ignoring android.opaque: false, a highBitDepth canvas is opaque on " +
        "Android (the 10-bit format only has 2 bits of alpha)."
    );
  }
};

/**
 * Warns, in development on Android, about a change of these props that the
 * native view ignores: the backing view is created from them when the canvas
 * mounts (see SkiaView.java, whose setters these rules mirror).
 */
export const warnBackingViewChange = (
  mount: BackingViewProps,
  prev: BackingViewProps,
  next: BackingViewProps
) => {
  if (!__DEV__ || Platform.OS !== "android") {
    return;
  }
  // Read as the native side receives them, so these rules see what its
  // setters see.
  const before = androidNativeProps(prev.android);
  const after = androidNativeProps(next.android);
  if (before.androidBackingView !== after.androidBackingView) {
    warnIgnoredChange("android.backingView");
  }
  const mounted = androidNativeProps(mount.android);
  if (mounted.androidBackingView === "SurfaceView") {
    const version = Number(Platform.Version);
    if (
      !zOrderOnTopChangesInPlace(version, mounted.androidZOrderMediaOverlay) &&
      before.androidZOrderOnTop !== after.androidZOrderOnTop
    ) {
      warnIgnoredChange("android.zOrderOnTop");
    }
    if (
      !zOrderMediaOverlayChangesInPlace(version) &&
      before.androidZOrderMediaOverlay !== after.androidZOrderMediaOverlay
    ) {
      warnIgnoredChange("android.zOrderMediaOverlay");
    }
  }
  // The buffer format is read at mount, and so is the opacity the 10-bit
  // format implies.
  if (resolveHighBitDepth(prev) !== resolveHighBitDepth(next)) {
    warnIgnoredChange("highBitDepth");
  }
  if (
    resolveHighBitDepth(mount) &&
    (prev.android?.opaque !== false) !== (next.android?.opaque !== false)
  ) {
    warnIgnoredChange("android.opaque (a highBitDepth canvas is opaque)");
  }
};

/**
 * warnBackingViewAtMount() and warnBackingViewChange() for a function
 * component: checks the props it mounts with, then compares the props of each
 * render with the previous one's.
 */
export const useBackingViewWarning = (props: BackingViewProps) => {
  const mount = useRef(props);
  const prev = useRef(props);
  useEffect(() => {
    warnBackingViewAtMount(mount.current);
  }, []);
  useEffect(() => {
    warnBackingViewChange(mount.current, prev.current, props);
    prev.current = props;
  });
};
