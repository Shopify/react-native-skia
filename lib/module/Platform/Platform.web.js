import React, { useLayoutEffect, useMemo, useRef } from "react";
import { isRNModule } from "../skia/types";
// eslint-disable-next-line max-len
// https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/modules/useElementLayout/index.js
const DOM_LAYOUT_HANDLER_NAME = "__reactLayoutHandler";
let resizeObserver = null;
const getObserver = () => {
  if (resizeObserver == null) {
    resizeObserver = new window.ResizeObserver(function (entries) {
      entries.forEach(entry => {
        const node = entry.target;
        const {
          left,
          top,
          width,
          height
        } = entry.contentRect;
        const onLayout = node[DOM_LAYOUT_HANDLER_NAME];
        if (typeof onLayout === "function") {
          // setTimeout 0 is taken from react-native-web (UIManager)
          setTimeout(() => onLayout({
            timeStamp: Date.now(),
            nativeEvent: {
              layout: {
                x: left,
                y: top,
                width,
                height
              }
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            currentTarget: 0,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
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
            type: ""
          }), 0);
        }
      });
    });
  }
  return resizeObserver;
};
const useElementLayout = (ref, onLayout) => {
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
const View = ({
  children,
  onLayout,
  style: rawStyle
}) => {
  const style = useMemo(() => rawStyle !== null && rawStyle !== void 0 ? rawStyle : {}, [rawStyle]);
  const ref = useRef(null);
  useElementLayout(ref, onLayout);
  const cssStyles = useMemo(() => {
    return {
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
      ...style
    };
  }, [style]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: cssStyles
  }, children);
};
export const Platform = {
  OS: "web",
  PixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  // window is not defined on node
  resolveAsset: source => {
    if (isRNModule(source)) {
      if (typeof source === "number" && typeof require === "function") {
        const {
          getAssetByID
        } = require("react-native/Libraries/Image/AssetRegistry");
        const {
          httpServerLocation,
          name,
          type
        } = getAssetByID(source);
        const uri = `${httpServerLocation}/${name}.${type}`;
        return uri;
      }
      throw new Error("Asset source is a number - this is not supported on the web");
    }
    return source.default;
  },
  findNodeHandle: () => {
    throw new Error("findNodeHandle is not supported on the web");
  },
  View
};
//# sourceMappingURL=Platform.web.js.map