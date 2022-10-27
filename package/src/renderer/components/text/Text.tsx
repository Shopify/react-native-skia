import React from "react";

import type { SkiaProps } from "../../processors";
import type { SimpleTextProps } from "../../../dom/types";

export const SimpleText = (props: SkiaProps<SimpleTextProps>) => {
  return <skSimpleText {...props} />;
};

SimpleText.defaultProps = {
  x: 0,
  y: 0,
};

export const Text = (props: SkiaProps<SimpleTextProps>) => {
  console.log(
    "<Text /> is now <SimpleText />. In the next release <Text /> will have a new API."
  );
  return <skSimpleText {...props} />;
};

Text.defaultProps = {
  x: 0,
  y: 0,
};
