import React from "react";

import type { CustomDrawingNodeProps } from "../../dom/types";

export const Drawing = (props: CustomDrawingNodeProps) => {
  console.warn(
    // eslint-disable-next-line max-len
    "<Drawing /> is deprecated. Use createPicture() instead. See https://shopify.github.io/react-native-skia/docs/getting-started/hello-world#custom-drawings for more information."
  );
  return <skDrawing {...props} />;
};
