import { createElement, useEffect, useRef } from "react";
import { SkiaPictureView } from "../views/SkiaPictureView.web";
const SkiaPictureViewNativeComponent = ({
  nativeID,
  debug,
  opaque,
  onLayout,
  ...viewProps
}) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      global.SkiaViewApi.registerView(nativeID, ref.current);
    }
  }, [nativeID]);
  return /*#__PURE__*/createElement(SkiaPictureView, {
    ref,
    debug,
    opaque,
    onLayout,
    ...viewProps
  });
};
// eslint-disable-next-line import/no-default-export
export default SkiaPictureViewNativeComponent;
//# sourceMappingURL=SkiaPictureViewNativeComponent.web.js.map