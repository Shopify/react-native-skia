import type { FC } from "react";

import { Snapshot1 } from "./Snapshot1";
import { Snapshot2 } from "./Snapshot2";
import { Snapshot3 } from "./Snapshot3";

export const Screens: Record<string, FC> = {
  Snapshot1,
  Snapshot2,
  Snapshot3,
};
