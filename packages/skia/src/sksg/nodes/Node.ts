/* eslint-disable @typescript-eslint/ban-ts-comment */
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

export const splitProps = <T extends object | null>(props: T) => {
  "worklet";
  if (props === null) {
    return { props: null };
  }
  let hasAnimatedProps = false;
  const animatedProps: Partial<AnimatedProps<T>> = {};
  Object.keys(props).forEach((key) => {
    // @ts-ignore
    const value = props[key];
    if (isSharedValue(value)) {
      hasAnimatedProps = true;
      // @ts-ignore
      animatedProps[key] = value;
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
