import type { SkiaValue } from "../values";
import { useComputedValue } from "../values/hooks/useComputedValue";

import type { AnimatedProps } from "./processors";
import { isValue, isSelector } from "./processors";
import { mapKeys } from "./typeddash";

type ComputedPropsCallback<P, R> = (props: P) => R;

export const useComputedProps = <P, R>(
  cb: ComputedPropsCallback<P, R>,
  props: AnimatedProps<P>
) => {
  const values = Object.values(props);
  return useComputedValue(() => cb(materialize(props)), values);
};

const materialize = <P>(props: AnimatedProps<P>) => {
  const result = { ...props };
  mapKeys(props).forEach((key) => {
    const prop = props[key];
    if (isValue(prop)) {
      result[key] = (prop as SkiaValue<P[typeof key]>).current;
    } else if (isSelector(prop)) {
      result[key] = prop.selector(prop.value.current) as P[typeof key];
    }
  });
  return result as P;
};
