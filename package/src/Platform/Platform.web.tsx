import type { RefObject, CSSProperties } from "react";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import type { LayoutChangeEvent, ViewComponent, ViewProps } from "react-native";

import type { DataModule } from "../skia/types";
import { isRNModule } from "../skia/types";

import type { IPlatform } from "./IPlatform";

// eslint-disable-next-line max-len
// https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/modules/useElementLayout/index.js
const DOM_LAYOUT_HANDLER_NAME = "__reactLayoutHandler";
type OnLayout = ((event: LayoutChangeEvent) => void) | undefined;
type Div = HTMLDivElement & {
  __reactLayoutHandler: OnLayout;
};

let resizeObserver: ResizeObserver | null = null;

const getObserver = () => {
  if (resizeObserver == null) {
    resizeObserver = new window.ResizeObserver(function (entries) {
      entries.forEach((entry) => {
        const node = entry.target as Div;
        const { left, top, width, height } = entry.contentRect;
        const onLayout = node[DOM_LAYOUT_HANDLER_NAME];
        if (typeof onLayout === "function") {
          // setTimeout 0 is taken from react-native-web (UIManager)
          setTimeout(
            () =>
              onLayout({
                timeStamp: Date.now(),
                nativeEvent: { layout: { x: left, y: top, width, height } },
                currentTarget: 0,
                target: 0,
                bubbles: false,
                cancelable: false,
                defaultPrevented: false,
                eventPhase: 0,
                isDefaultPrevented() {
                  throw new Error("Method not supported on web.");
                },
                isPropagationStopped() {
                  throw new Error("Method not supported on web.");
                },
                persist() {
                  throw new Error("Method not supported on web.");
                },
                preventDefault() {
                  throw new Error("Method not supported on web.");
                },
                stopPropagation() {
                  throw new Error("Method not supported on web.");
                },
                isTrusted: true,
                type: "",
              }),
            0
          );
        }
      });
    });
  }
  return resizeObserver;
};

const useElementLayout = (ref: RefObject<Div>, onLayout: OnLayout) => {
  const observer = getObserver();

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
  }, [observer, ref]);
};

const View = (({ children, onLayout, style: rawStyle }: ViewProps) => {
  const style = useMemo(() => (rawStyle ?? {}) as CSSProperties, [rawStyle]);
  const ref = useRef<Div>(null);
  useElementLayout(ref, onLayout);
  const cssStyles = useMemo(() => {
    return {
      ...style,
      display: "flex",
      flexDirection: style.flexDirection || "inherit",
      flexWrap: style.flexWrap || "nowrap",
      justifyContent: style.justifyContent || "flex-start",
      alignItems: style.alignItems || "stretch",
      alignContent: style.alignContent || "stretch",
    };
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
