import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { unstable_createElement as unstableCreateElement } from "react-native-web";
import type { Int32 } from "react-native/Libraries/Types/CodegenTypes";
import type { ViewProps } from "react-native";

import { contextIdToId } from "./utils";

export interface NativeProps extends ViewProps {
  contextId: Int32;
  transparent: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function debounced(
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const context = this;
    const callNow = immediate && !timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = undefined;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

function resizeCanvas(canvas?: HTMLCanvasElement) {
  if (!canvas) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;

  const { height, width } = canvas.getBoundingClientRect();
  canvas.setAttribute("height", (height * dpr).toString());
  canvas.setAttribute("width", (width * dpr).toString());
}

// eslint-disable-next-line import/no-default-export
export default function WebGPUViewNativeComponent(props: NativeProps) {
  const { contextId, style, transparent, ...rest } = props;

  const canvasElm = useRef<HTMLCanvasElement>();

  useEffect(() => {
    const onResize = debounce(() => resizeCanvas(canvasElm.current), 100);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return unstableCreateElement("canvas", {
    ...rest,
    style: [
      styles.view,
      styles.flex1,
      transparent === false && { backgroundColor: "white" }, // Canvas elements are transparent by default on the web
      style,
    ],
    id: contextIdToId(contextId),
    ref: (ref: HTMLCanvasElement) => {
      canvasElm.current = ref;
      if (ref) {
        resizeCanvas(ref);
      }
    },
  });
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  view: {
    alignItems: "stretch",
    backgroundColor: "transparent",
    // @ts-expect-error - not a valid RN style, but it's valid for web
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
    zIndex: 0,
  },
});
