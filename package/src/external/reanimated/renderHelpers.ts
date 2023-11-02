/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable reanimated/js-function-in-worklet */
import {
  makeMutable,
  runOnUI,
  type SharedValue,
} from "react-native-reanimated";

import type { Container } from "../../renderer/Container";
import { type AnimatedProps } from "../../renderer/processors";
import type { Node } from "../../dom/types";

import {
  startMapper,
  stopMapper,
  isSharedValue,
  HAS_REANIMATED3,
  HAS_REANIMATED2,
  runOnJS,
} from "./moduleWrapper";

interface ReanimatedSelector<T> {
  __typename__: "ReanimatedSelector";
  value: SharedValue<T>;
  selector: (value: T) => unknown;
}

const isReanimatedSelector = (
  value: unknown
): value is ReanimatedSelector<any> =>
  !!value &&
  typeof value === "object" &&
  "__typename__" in value &&
  (value as any).__typename__ === "ReanimatedSelector";

export const select = <T>(
  value: SharedValue<T>,
  selector: (value: T) => unknown
) => {
  return {
    __typename__: "ReanimatedSelector",
    value,
    selector,
  };
};

const _bindings = new WeakMap<Node<unknown>, unknown>();
const _selectors = makeMutable<((values: any) => unknown)[]>([]);

export const getSelectorsForValue = () => {
  "worklet";
  return _selectors.value;
};

export const unbindReanimatedNode = (node: Node<unknown>) => {
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    stopMapper(previousMapperId as number);
  }
};

let _id = 0;

export function extractReanimatedProps(_props: AnimatedProps<any>): {
  props: AnimatedProps<any, never>;
  reanimatedProps: AnimatedProps<any, SharedValue<unknown>>;
  selectors: Record<string, ReanimatedSelector<unknown>>;
} {
  if (!HAS_REANIMATED3 && !HAS_REANIMATED2) {
    return { props: _props, reanimatedProps: {}, selectors: {} };
  }
  const reanimatedProps = {} as AnimatedProps<any>;
  const props = {} as AnimatedProps<any>;
  const selectors = {} as Record<string, ReanimatedSelector<unknown>>;
  for (const propName in _props) {
    if (propName === "children") {
      continue;
    }
    const propValue = _props[propName];
    if (isSharedValue(propValue)) {
      reanimatedProps[propName] = propValue;
      props[propName] = propValue.value;
    } else if (isReanimatedSelector(propValue)) {
      selectors[propName] = propValue;
      props[propName] = propValue.selector(propValue.value.value);
    } else {
      props[propName] = propValue;
    }
  }
  return { props, reanimatedProps, selectors };
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
  reanimatedProps: AnimatedProps<any>,
  selectorProps: Record<string, ReanimatedSelector<unknown>>
) {
  if (HAS_REANIMATED2 && !HAS_REANIMATED3) {
    if (Object.keys(selectorProps).length > 0) {
      console.warn(
        "Reanimated selectors are only supported from version 3 and onwards"
      );
    }
    return bindReanimatedProps2(container, node, reanimatedProps);
  }
  if (!HAS_REANIMATED3) {
    return;
  }
  const sharedValues = Object.values(reanimatedProps);
  const selectorValues = Object.values(selectorProps);
  const previousMapperId = _bindings.get(node);
  if (previousMapperId !== undefined) {
    stopMapper(previousMapperId as number);
  }
  const viewId = container.getNativeId();
  if (selectorValues.length > 0) {
    for (const propName in selectorProps) {
      const selector = selectorProps[propName];
      const id = _id++;
      runOnUI(() => {
      selector.value.addListener(_id++, () => {
        "worklet";
        const value = selector.selector(selector.value.value);
        node.setProp(propName, value);
      })})();
      // _selectors.value.push(() => {
      //   "worklet";
      //   const value = selector.selector(selector.value.value);
      //   node.setProp(propName, value);

      //   // // TODO: move outside
      //   // if (SkiaViewApi) {
      //   //   SkiaViewApi.requestRedraw(viewId);
      //   // } else {
      //   //   container.redraw();
      //   // }
      // });
    }
  }
  if (sharedValues.length > 0) {
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
