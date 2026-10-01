import React, { useImperativeHandle, useMemo, useRef } from "react";

import type { SkGraphiteContext } from "../skia/types";
import SkiaGraphiteViewNativeComponent from "../specs/SkiaGraphiteViewNativeComponent";

import { SkiaViewApi } from "./api";
import type { SkiaGraphiteViewNativeProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

export interface SkiaGraphiteViewRef {
  /**
   * The recording side of the view. Call it once the view is mounted. The
   * returned context can be captured into worklets and used from any runtime.
   */
  getContext(): SkGraphiteContext;
  getNativeId(): number;
}

export interface SkiaGraphiteViewProps extends SkiaGraphiteViewNativeProps {
  ref?: React.Ref<SkiaGraphiteViewRef>;
}

/**
 * A view presenting frames recorded with Skia Graphite. Requires the Graphite
 * backend (install-skia-graphite); with the default backend it renders
 * nothing. See {@link SkGraphiteContext}.
 */
export const SkiaGraphiteView = ({
  debug = false,
  opaque = false,
  highBitDepth = false,
  ref,
  ...viewProps
}: SkiaGraphiteViewProps) => {
  const nativeId = useMemo(() => SkiaViewNativeId.current++, []);
  const viewRef =
    useRef<React.ComponentRef<typeof SkiaGraphiteViewNativeComponent>>(null);
  useImperativeHandle(
    ref,
    () => ({
      getNativeId: () => nativeId,
      getContext: () => {
        assertSkiaViewApi();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const view = viewRef.current as any;
        if (!view) {
          throw new Error(
            "SkiaGraphiteView: getContext() was called before the view was mounted."
          );
        }
        // The layout is known synchronously on the new architecture;
        // getBoundingClientRect became stable in React Native 0.83.
        const size =
          "getBoundingClientRect" in view
            ? view.getBoundingClientRect()
            : view.unstable_getBoundingClientRect();
        return SkiaViewApi.makeGraphiteContext(
          nativeId,
          size.width,
          size.height,
          opaque,
          highBitDepth
        );
      },
    }),
    [nativeId, opaque, highBitDepth]
  );
  return (
    <SkiaGraphiteViewNativeComponent
      ref={viewRef}
      collapsable={false}
      nativeID={`${nativeId}`}
      debug={debug}
      opaque={opaque}
      highBitDepth={highBitDepth}
      {...viewProps}
    />
  );
};

const assertSkiaViewApi = () => {
  if (SkiaViewApi === null || SkiaViewApi.makeGraphiteContext === null) {
    throw Error("Skia View Api was not found.");
  }
};
