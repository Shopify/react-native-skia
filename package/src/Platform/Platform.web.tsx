import React, { useLayoutEffect, useMemo, useRef } from "react";
import type {
  LayoutChangeEvent,
  ViewComponent,
  ViewProps,
  ViewStyle,
} from "react-native";

import type { DataModule } from "../skia/types";
import { isRNModule } from "../skia/types";

import type { IPlatform } from "./IPlatform";

const DOM_LAYOUT_HANDLER_NAME = "__reactLayoutHandler";
type Div = HTMLDivElement & {
  __reactLayoutHandler: ((event: LayoutChangeEvent) => void) | undefined;
};

const observer = new ResizeObserver(
  ([
    {
      contentRect: { left, top, width, height },
      target,
    },
  ]) => {
    const node = target as Div;
    if (node[DOM_LAYOUT_HANDLER_NAME]) {
      node[DOM_LAYOUT_HANDLER_NAME]({
        timestamp: Date.now(),
        nativeEvent: { layout: { x: left, y: top, width, height } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
  }
);

const View = (({ children, onLayout, style: rawStyle }: ViewProps) => {
  const style = rawStyle as ViewStyle;
  const ref = useRef<Div>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node !== null) {
      node[DOM_LAYOUT_HANDLER_NAME] = onLayout;
    }
  }, [ref, onLayout]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node != null && observer != null) {
      if (typeof node[DOM_LAYOUT_HANDLER_NAME] === "function") {
        observer.observe(node);
      } else {
        observer.unobserve(node);
      }
    }
    return () => {
      if (node != null && observer != null) {
        observer.unobserve(node);
      }
    };
  }, [ref]);

  const cssStyles = useMemo(() => {
    if (style) {
      return {
        ...style,
        display: "flex",
        flexDirection: style.flexDirection || "column",
        flexWrap: style.flexWrap || "nowrap",
        justifyContent: style.justifyContent || "flex-start",
        alignItems: style.alignItems || "stretch",
        alignContent: style.alignContent || "stretch",
      };
    }
    return {};
  }, [style]);

  return (
    <div ref={ref} style={cssStyles}>
      {children}
    </div>
  );
}) as unknown as typeof ViewComponent;

export const Platform: IPlatform = {
  OS: "web",
  PixelRatio: window.devicePixelRatio,
  requireNativeComponent: () => {
    throw new Error("requireNativeComponent is not supported on the web");
  },
  resolveAsset: (source: DataModule) => {
    if (isRNModule(source)) {
      throw new Error(
        "Image source is a number - this is not supported on the web"
      );
    }
    return source.default;
  },
  findNodeHandle: () => {
    throw new Error("findNodeHandle is not supported on the web");
  },
  NativeModules: {},
  View,
};
