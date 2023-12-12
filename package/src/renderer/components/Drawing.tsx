import React from "react";

import type { CustomDrawingNodeProps } from "../../dom/types";

/**
 * @deprecated If you are looking to use the Skia imperative API, you can use:
 * The picture API: https://shopify.github.io/react-native-skia/docs/shapes/pictures/
 * The offscreen API: https://shopify.github.io/react-native-skia/docs/animations/textures
 */
export const Drawing = (props: CustomDrawingNodeProps) => {
  return <skDrawing {...props} />;
};
