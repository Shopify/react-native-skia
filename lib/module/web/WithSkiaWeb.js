import React, { useMemo, lazy, Suspense } from "react";
import { Platform } from "../Platform";
import { LoadSkiaWeb } from "./LoadSkiaWeb";
export const WithSkiaWeb = ({
  getComponent,
  fallback,
  opts,
  componentProps
}) => {
  const Inner = useMemo(
  // TODO: investigate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => /*#__PURE__*/lazy(async () => {
    if (Platform.OS === "web") {
      await LoadSkiaWeb(opts);
    } else {
      console.warn("<WithSkiaWeb /> is only necessary on web. Consider not using on native.");
    }
    return getComponent();
  }),
  // We we to run this only once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);
  return /*#__PURE__*/React.createElement(Suspense, {
    fallback: fallback !== null && fallback !== void 0 ? fallback : null
  }, /*#__PURE__*/React.createElement(Inner, componentProps));
};
//# sourceMappingURL=WithSkiaWeb.js.map