function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import { SkiaViewNativeId } from "../views/SkiaViewNativeId";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import { SkiaSGRoot } from "../sksg/Reconciler";
import { Skia } from "../skia";
export const useCanvasRef = () => useRef(null);
const NativeSkiaPictureView = SkiaPictureViewNativeComponent;

// TODO: no need to go through the JS thread for this
const useOnSizeEvent = (resultValue, onLayout) => {
  return useCallback(event => {
    if (onLayout) {
      onLayout(event);
    }
    const {
      width,
      height
    } = event.nativeEvent.layout;
    if (resultValue) {
      resultValue.value = {
        width,
        height
      };
    }
  }, [onLayout, resultValue]);
};
export const Canvas = /*#__PURE__*/forwardRef(({
  mode,
  debug,
  opaque,
  children,
  onSize,
  onLayout: _onLayout,
  ...viewProps
}, ref) => {
  const rafId = useRef(null);
  const onLayout = useOnSizeEvent(onSize, _onLayout);
  // Native ID
  const nativeId = useMemo(() => {
    return SkiaViewNativeId.current++;
  }, []);

  // Root
  const root = useMemo(() => new SkiaSGRoot(Skia, nativeId), [nativeId]);

  // Render effects
  useLayoutEffect(() => {
    root.render(children);
  }, [children, root]);
  useEffect(() => {
    return () => {
      root.unmount();
    };
  }, [root]);
  const requestRedraw = useCallback(() => {
    rafId.current = requestAnimationFrame(() => {
      root.render(children);
      if (mode === "continuous") {
        requestRedraw();
      }
    });
  }, [children, mode, root]);
  useEffect(() => {
    if (mode === "continuous") {
      console.warn("The `mode` property in `Canvas` is deprecated.");
      requestRedraw();
    }
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [mode, requestRedraw]);
  // Component methods
  useImperativeHandle(ref, () => ({
    makeImageSnapshot: rect => {
      return SkiaViewApi.makeImageSnapshot(nativeId, rect);
    },
    makeImageSnapshotAsync: rect => {
      return SkiaViewApi.makeImageSnapshotAsync(nativeId, rect);
    },
    redraw: () => {
      SkiaViewApi.requestRedraw(nativeId);
    },
    getNativeId: () => {
      return nativeId;
    }
  }));
  return /*#__PURE__*/React.createElement(NativeSkiaPictureView, _extends({
    collapsable: false,
    nativeID: `${nativeId}`,
    debug: debug,
    opaque: opaque,
    onLayout: onLayout
  }, viewProps));
});
//# sourceMappingURL=Canvas.js.map