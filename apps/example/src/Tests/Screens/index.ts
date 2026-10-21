import type { FC } from "react";

import { GraphiteView, GraphiteViewTransform } from "./GraphiteView";
import { IsOnMainThread } from "./IsOnMainThread";
import { OnLayout } from "./OnLayout";
import { SharedValueReads } from "./SharedValueReads";

export const Screens: Record<string, FC> = {
  GraphiteView,
  GraphiteViewTransform,
  IsOnMainThread,
  OnLayout,
  SharedValueReads,
};
