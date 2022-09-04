import React from "react";

import type { SkiaProps } from "../../processors";

export const LinearToSRGBGamma = (props: SkiaProps<void>) => {
  return <skLinearToSRGBGammaColorFilter {...props} />;
};
