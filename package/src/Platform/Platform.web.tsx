import React, { useEffect, useMemo, useRef } from "react";
import type { ViewProps } from "react-native";

import type { DataModule } from "../skia/types";
import { isRNModule } from "../skia/types";

import type { IPlatform } from "./IPlatform";

const getRect = (node: HTMLElement) => {
  const height = node.offsetHeight;
  const width = node.offsetWidth;
  let left = node.offsetLeft;
  let top = node.offsetTop;
  node = node.offsetParent as HTMLDivElement;

  while (node && node.nodeType === 1 /* Node.ELEMENT_NODE */) {
    left += node.offsetLeft + node.clientLeft - node.scrollLeft;
    top += node.offsetTop + node.clientTop - node.scrollTop;
    node = node.offsetParent as HTMLDivElement;
  }

  top -= window.scrollY;
  left -= window.scrollX;

  return { width, height, top, left };
};

const measureLayout = (node: HTMLElement) => {
  const relativeNode = node && node.parentNode;
  if (node && relativeNode) {
    if (node.isConnected && relativeNode.isConnected) {
      const relativeRect = getRect(relativeNode as HTMLElement);
      const { height, left, top, width } = getRect(node);
      const x = left - relativeRect.left;
      const y = top - relativeRect.top;
      return { x, y, width, height, left, top };
    }
  }
  return null;
};

const View = ({ onLayout, style, children }: ViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const resizeObserver = useMemo(
    () =>
      new ResizeObserver(() => {
        const layout = measureLayout(ref.current!);
        if (layout === null) {
          throw new Error("expected layout to be non-null");
        }

        onLayout &&
          onLayout({
            nativeEvent: { layout: layout },
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
          });
      }),
    [onLayout]
  );

  useEffect(() => {
    const divRef = ref.current!;
    if (divRef) {
      resizeObserver.observe(divRef);
      return () => {
        resizeObserver.unobserve(divRef);
      };
    }
    return undefined;
  }, [resizeObserver]);
  return (
    <div
      ref={ref}
      style={{
        alignItems: "stretch",
        backgroundColor: "transparent",
        border: "0 solid black",
        boxSizing: "border-box",
        display: "flex",
        flexBasis: "auto",
        flexDirection: "column",
        flexShrink: 0,
        listStyle: "none",
        margin: 0,
        minHeight: 0,
        minWidth: 0,
        padding: 0,
        position: "relative",
        textDecoration: "none",
        zIndex: 0,
      }}
    >
      {children}
    </div>
  );
};

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
