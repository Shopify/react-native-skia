/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Container } from "../../renderer/Container";
import type { AnimatedProps } from "../../renderer/processors";
import type { Node } from "../../dom/types";

import {
  startMapper,
  stopMapper,
  isSharedValue,
  HAS_REANIMATED3,
  HAS_REANIMATED2,
  runOnJS,
} from "./moduleWrapper";

const _bindings = new WeakMap<Node<unknown>, unknown>();

export const unbindReanimatedNode = (node: Node<unknown>) => {
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    stopMapper(previousMapperId as number);
  }
};

export function extractReanimatedProps(props: AnimatedProps<any>) {
  if (!HAS_REANIMATED3 && !HAS_REANIMATED2) {
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

function bindReanimatedProps2(
  container: Container,
  node: Node<any>,
  reanimatedProps: AnimatedProps<any>
) {
  const sharedValues = Object.values(reanimatedProps);
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    stopMapper(previousMapperId as number);
  }
  if (sharedValues.length > 0) {
    const viewId = container.getNativeId();
    const { SkiaViewApi } = global;
    const updateProps = () => {
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
    };
    const mapperId = startMapper(() => {
      "worklet";
      runOnJS(updateProps)();
    }, sharedValues);
    _bindings.set(node, mapperId);
  }
}

export function bindReanimatedProps(
  container: Container,
  node: Node<any>,
  reanimatedProps: AnimatedProps<any>
) {
  if (HAS_REANIMATED2 && !HAS_REANIMATED3) {
    return bindReanimatedProps2(container, node, reanimatedProps);
  }
  if (!HAS_REANIMATED3) {
    return;
  }
  const sharedValues = Object.values(reanimatedProps);
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    stopMapper(previousMapperId as number);
  }
  if (sharedValues.length > 0) {
    const viewId = container.getNativeId();
    const { SkiaViewApi } = global;
    const mapperId = startMapper(() => {
      "worklet";
      if (node) {
        for (const propName in reanimatedProps) {
          node.setProp(propName, reanimatedProps[propName].value);
        }
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
