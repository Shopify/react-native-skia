import React, { useEffect, useRef } from "react";
import type { ViewComponent, ViewProps, ViewStyle } from "react-native";

import type { DataModule } from "../skia/types";
import { isRNModule } from "../skia/types";

import type { IPlatform } from "./IPlatform";

const View = (({ children, style: rawStyle, onLayout }: ViewProps) => {
  const style = rawStyle as ViewStyle;
  const ref = useRef(null);

  useEffect(() => {
    if (onLayout && ref.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { left, top, width, height } = entry.contentRect;
          onLayout({
            timeStamp: 0,
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
            nativeEvent: { layout: { x: left, y: top, width, height } },
          });
        }
      });

      observer.observe(ref.current);

      return () => observer.disconnect();
    }
    return undefined;
  }, [onLayout]);

  let cssStyles = {};
  if (style) {
    cssStyles = {
      ...style,
      display: "flex",
      flexDirection: style.flexDirection || "column",
      flexWrap: style.flexWrap || "nowrap",
      justifyContent: style.justifyContent || "flex-start",
      alignItems: style.alignItems || "stretch",
      alignContent: style.alignContent || "stretch",
    };
  }

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
