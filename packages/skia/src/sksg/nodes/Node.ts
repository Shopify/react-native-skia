import type { NodeType } from "../../dom/types";

export interface Node<Props = unknown> {
  type: NodeType;
  isDeclaration: boolean;
  props: Props;
  children: Node[];
}
