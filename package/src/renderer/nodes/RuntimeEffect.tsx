import { forwardRef } from "react";

import { RuntimeEffect as RuntimeEffect } from "../../skia";
import { NodeType } from "../Host";
import type { SkNode } from "../Host";

export interface RuntimeEffectProps {
  source: string;
}

export const RuntimeEffect = forwardRef<RuntimeEffect, RuntimeEffectProps>(
  (props, ref) => {
    return <skRuntimeEffect ref={ref} {...props} />;
  }
);

export const RuntimeEffectNode = (
  props: RuntimeEffectProps,
  instance: RuntimeEffect
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
