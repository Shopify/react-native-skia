import type { NodeType } from "../dom/types";

export interface Node<Props = unknown> {
  type: NodeType;
  props: Props;
  children: Node[];
}
