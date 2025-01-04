/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";
import { sortNodeChildren } from "../nodes";

import type { Recorder } from "./Recorder";

const pushColorFilters = (recorder: Recorder, colorFilters: Node<any>[]) => {
  colorFilters.forEach((colorFilter) => {
    recorder.pushColorFilter(colorFilter.type, colorFilter.props);
    if (colorFilter.children.length > 0) {
      pushColorFilters(recorder, colorFilter.children);
      recorder.composeColorFilters();
    }
  });
};

const visitNode = (recorder: Recorder, node: Node<any>) => {
  const { colorFilters, drawings } = sortNodeChildren(node);
  const shouldPushPaint = colorFilters.length > 0;
  if (shouldPushPaint) {
    recorder.savePaint({});
    pushColorFilters(recorder, colorFilters);
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
