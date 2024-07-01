import type { CircleProps, NodeType } from "../dom/types";
import type { AnimatedProps } from "../renderer";

export interface PropMap {
  [NodeType.Circle]: CircleProps;
  [name: string]: object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownProps = Record<string, any>;

export interface SGNode<P extends object = UnknownProps> {
  type: NodeType;
  props: AnimatedProps<P>;
  //  children?: SGNode[];
}

export const createNode = <T extends NodeType>(
  type: T,
  props: AnimatedProps<PropMap[T]>
): SGNode<PropMap[T]> => {
  "worklet";
  return { type, props };
};
