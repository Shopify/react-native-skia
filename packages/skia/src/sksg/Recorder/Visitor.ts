/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";
import { sortNodeChildren } from "../nodes";

import type { Recorder } from "./Recorder";

const pushColorFilters = (recorder: Recorder, colorFilters: Node<any>[]) => {
  //let lastFilter: NodeType | null = null;
  colorFilters.forEach((colorFilter) => {
    if (colorFilter.children.length > 0) {
      pushColorFilters(recorder, colorFilter.children);
    }
    recorder.pushColorFilter(colorFilter.type, colorFilter.props);
    //lastFilter = colorFilter.type;
  });
  // If the filter doesn't need children, we compose it
  //   const needsComposition = lastFilter !== NodeType.LerpColorFilter;
  //   if (needsComposition) {
  //     recorder.composeColorFilters();
  //   }
};

const visitNode = (recorder: Recorder, node: Node<any>) => {
  const { colorFilters, drawings } = sortNodeChildren(node);
  const shouldPushPaint = colorFilters.length > 0;
  if (shouldPushPaint) {
    recorder.savePaint({});
    pushColorFilters(recorder, colorFilters);
    recorder.composeColorFilters();
    recorder.composeColorFilters();
    recorder.materializePaint();
  }
  if (node.type === NodeType.Image) {
    recorder.drawImage(node.props);
  }
  drawings.forEach((drawing) => {
    visitNode(recorder, drawing);
  });
  if (shouldPushPaint) {
    recorder.restorePaint();
  }
};

export const visit = (recorder: Recorder, root: Node[]) => {
  root.forEach((node) => {
    visitNode(recorder, node);
  });
};
