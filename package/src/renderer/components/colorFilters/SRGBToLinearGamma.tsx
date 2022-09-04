import React from "react";

import type { SkiaProps } from "../../processors/Animations/Animations";

export const SRGBToLinearGamma = (props: SkiaProps<void>) => {
  return <skSRGBToLinearGammaColorFilter {...props} />;
};
