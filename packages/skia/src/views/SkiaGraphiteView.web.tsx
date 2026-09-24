import React, { useImperativeHandle, useMemo } from "react";

import type { SkGraphiteContext } from "../skia/types";
import { Platform } from "../Platform";

import type { SkiaGraphiteViewNativeProps } from "./types";
import { SkiaViewNativeId } from "./SkiaViewNativeId";

export interface SkiaGraphiteViewRef {
  getContext(): SkGraphiteContext;
  getNativeId(): number;
}

export interface SkiaGraphiteViewProps extends SkiaGraphiteViewNativeProps {
  ref?: React.Ref<SkiaGraphiteViewRef>;
}

// Graphite is a native backend: on the web the view is an empty container
// and its context cannot be obtained.
export const SkiaGraphiteView = ({
  debug: _debug,
  opaque: _opaque,
  highBitDepth: _highBitDepth,
  ref,
  ...viewProps
}: SkiaGraphiteViewProps) => {
  const nativeId = useMemo(() => SkiaViewNativeId.current++, []);
  useImperativeHandle(
    ref,
    () => ({
      getNativeId: () => nativeId,
      getContext: () => {
        throw new Error("SkiaGraphiteView is not supported on the web.");
      },
    }),
    [nativeId]
  );
  return <Platform.View {...viewProps} />;
};
