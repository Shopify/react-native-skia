/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable reanimated/js-function-in-worklet */
import type { Container } from "../../renderer/Container";
import type { AnimatedProps } from "../../renderer/processors";
import type { Node } from "../../dom/types";

import {
  startMapper,
  stopMapper,
  isSharedValue,
  HAS_REANIMATED3,
} from "./moduleWrapper";

const _bindings = new WeakMap<Node<unknown>, unknown>();

export function extractReanimatedProps(props: AnimatedProps<any>) {
  if (!HAS_REANIMATED3) {
    return [props, {}];
  }
  const reanimatedProps = {} as AnimatedProps<any>;
  const otherProps = {} as AnimatedProps<any>;
  for (const propName in props) {
    if (propName === "children") {
      continue;
    }
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
  if (!HAS_REANIMATED3) {
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
      // On React Native we use the SkiaViewApi to redraw because it can
      // run on the worklet thread (container.redraw can't)
      // if SkiaViewApi is undefined, we are on web and container.redraw()
      // can safely be invoked
      if (SkiaViewApi) {
        SkiaViewApi.requestRedraw(viewId);
      } else {
        container.redraw();
      }
    }, sharedValues);
    _bindings.set(node, mapperId);
  }
}
