/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable reanimated/js-function-in-worklet */
import type { Container } from "../../renderer/Container";
import type { AnimatedProps } from "../../renderer/processors";
import type { Node } from "../../dom/types";

import {
  startMapper,
  stopMapper,
  isSharedValue,
  HAS_REANIMATED,
} from "./moduleWrapper";

const _bindings = new WeakMap<Node<unknown>, unknown>();

export function extractReanimatedProps(props: AnimatedProps<any>) {
  if (!HAS_REANIMATED) {
    return [props, {}];
  }
  const reanimatedProps = {} as AnimatedProps<any>;
  const otherProps = {} as AnimatedProps<any>;
  for (const propName in props) {
    const propValue = props[propName];
    if (isSharedValue(propValue)) {
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
  node: Node<any>,
  reanimatedProps: AnimatedProps<any>
) {
  if (!HAS_REANIMATED) {
    return;
  }
  const sharedValues = Object.values(reanimatedProps);
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    stopMapper(previousMapperId);
  }
  if (sharedValues.length > 0) {
    const viewId = container.getNativeId();
    const { SkiaViewApi } = global;
    const mapperId = startMapper(() => {
      "worklet";
      for (const propName in reanimatedProps) {
        node && node.setProp(propName, reanimatedProps[propName].value);
      }
      SkiaViewApi && SkiaViewApi.requestRedraw(viewId);
    }, sharedValues);
    _bindings.set(node, mapperId);
  }
}
