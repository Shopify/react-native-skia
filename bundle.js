// package/src/web/LoadSkiaWeb.tsx
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
var ckSharedPromise;
var LoadSkiaWeb = async (opts) => {
  if (global.CanvasKit !== undefined) {
    return;
  }
  ckSharedPromise = ckSharedPromise ?? CanvasKitInit(opts);
  const CanvasKit = await ckSharedPromise;
  global.CanvasKit = CanvasKit;
};
var LoadSkia = LoadSkiaWeb;
// package/src/web/WithSkiaWeb.tsx
import {useMemo, lazy, Suspense} from "react";
import {
jsxDEV
} from "react/jsx-dev-runtime";
var WithSkiaWeb = ({
  getComponent,
  fallback,
  opts
}) => {
  const Inner = useMemo(() => lazy(async () => {
    await LoadSkiaWeb(opts);
    return getComponent();
  }), [getComponent, opts]);
  return jsxDEV(Suspense, {
    fallback: fallback ?? null,
    children: jsxDEV(Inner, {}, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
};
export {
  WithSkiaWeb,
  LoadSkiaWeb,
  LoadSkia
};
