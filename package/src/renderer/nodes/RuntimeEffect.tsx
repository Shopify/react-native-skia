import { forwardRef } from "react";

import type { IRuntimeEffect } from "../../skia";
import { NodeType } from "../Host";
import type { SkNode } from "../Host";

export interface RuntimeEffectProps {
  source: string;
}

export const RuntimeEffect = forwardRef<IRuntimeEffect, RuntimeEffectProps>(
  (props, ref) => {
    return <skRuntimeEffect ref={ref} {...props} />;
  }
);

export const RuntimeEffectNode = (
  props: RuntimeEffectProps,
  instance: IRuntimeEffect
): SkNode<NodeType.RuntimeEffect> => ({
  type: NodeType.RuntimeEffect,
  props,
  draw: () => {
    // Nothing to do here
  },
  children: [],
  memoizable: true,
  instance,
});
