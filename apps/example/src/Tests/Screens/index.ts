import type { FC } from "react";

import { GraphiteView, GraphiteViewTransform } from "./GraphiteView";
import { IsOnMainThread } from "./IsOnMainThread";
import { OnLayout } from "./OnLayout";
import { SharedImage } from "./SharedImage";
import { SharedValueReads } from "./SharedValueReads";

export const Screens: Record<string, FC> = {
  GraphiteView,
  GraphiteViewTransform,
  IsOnMainThread,
  OnLayout,
  SharedImage,
  SharedValueReads,
};
