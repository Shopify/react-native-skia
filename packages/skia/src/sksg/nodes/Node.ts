import type { SharedValue } from "react-native-reanimated";

import type { NodeType } from "../../dom/types";

import { isSharedValue } from "./utils";

type AnimatedProps<T> = Partial<{ [K in keyof T]: SharedValue<T[K]> }>;

export interface Node<Props extends object = object> {
  type: NodeType;
  isDeclaration: boolean;
  props: Props;
  children: Node[];
}

export const splitProps = <T extends object>(props: T) => {
  "worklet";
  let hasAnimatedProps = false;
  const animatedProps: Partial<AnimatedProps<T>> = {};
  Object.keys(props).forEach((key) => {
    const name = key as keyof T;
    const value = props[name];
    if (isSharedValue(value)) {
      hasAnimatedProps = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animatedProps[name] = value as any;
    }
  });
  return {
    props,
    animatedProps: hasAnimatedProps ? animatedProps : undefined,
  };
};

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
