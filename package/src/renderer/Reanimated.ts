import { Container } from "./Container";

import type { AnimatedProp, AnimatedProps } from "./processors";
import type { Node } from "../dom/types";

const _bindings = new WeakMap<Node<unknown>, unknown>();

function isReanimatedProp(value: AnimatedProp<any>) {
  return (
    value !== null && typeof value === "object" && value.modify !== undefined
  );
}

export function sanitizeReanimatedProps(props: AnimatedProps<any>) {
  const reanimatedProps = {} as AnimatedProps<any>;
  const otherProps = {} as AnimatedProps<any>;
  for (let propName in props) {
    const propValue = props[propName];
    if (isReanimatedProp(propValue)) {
      reanimatedProps[propName] = propValue;
      otherProps[propName] = propValue.value;
    } else {
      otherProps[propName] = propValue;
    }
  }
  return [otherProps, reanimatedProps];
}

export function bindReanimatedProps(
  container: Container,
  node: Node<unknown>,
  reanimatedProps: AnimatedProps<any>
) {
  const sharedValues = Object.values(reanimatedProps);
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    const {
      stopMapper,
    } = require("react-native-reanimated");
    stopMapper(previousMapperId);
  }
  if (sharedValues.length > 0) {
    const {
      startMapper,
    } = require("react-native-reanimated");
    const viewId = container.getNativeId();
    const SkiaViewApi = global.SkiaViewApi;
    const mapperId = startMapper(() => {
      "worklet";
      for (let propName in reanimatedProps) {
        node && node.setProp(propName, reanimatedProps[propName].value);
      }
      SkiaViewApi && SkiaViewApi.requestRedraw(viewId);
    }, sharedValues);
    _bindings.set(node, mapperId);
  }
}

export function sanitizeReanimatedProp(value: AnimatedProp<any>) {
  return value.value;
}
