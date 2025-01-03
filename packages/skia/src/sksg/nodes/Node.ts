import type { NodeType } from "../../dom/types";

export interface Node<Props = unknown> {
  type: NodeType;
  isDeclaration: boolean;
  props: Props;
  children: Node[];
}

export const sortNodes = (children: Node[]) => {
  "worklet";
  const declarations: Node[] = [];
  const drawings: Node[] = [];

  children.forEach((node) => {
    if (node.isDeclaration) {
      declarations.push(node);
    } else {
      drawings.push(node);
    }
  });

  return { declarations, drawings };
};
