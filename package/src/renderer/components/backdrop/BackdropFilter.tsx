import type { ReactNode } from "react";

import type { AnimatedProps } from "../../processors";
import type { GroupProps } from "../../../dom/types";

export interface BackdropFilterProps extends GroupProps {
  filter: ReactNode | ReactNode[];
}

export const BackdropFilter = ({}: AnimatedProps<BackdropFilterProps>) => {
  throw new Error("Not implemented yet");
};
