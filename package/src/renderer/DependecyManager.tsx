import type { RefObject } from "react";

import type { SkiaView } from "../views";
import type { ReadonlyValue } from "../values";

export interface DependencyManager {
  registerValue: <T>(value: ReadonlyValue<T>) => void;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const createDependencyManager = (
  ref: RefObject<SkiaView>
): DependencyManager => {
  const values: ReadonlyValue<unknown>[] = [];
  const unsubscribe: Array<() => void> = [];

  return {
    registerValue: function <T>(value: ReadonlyValue<T>) {
      if (!ref.current) {
        throw new Error("Canvas ref is not set");
      }
      if (values.indexOf(value) === -1) {
        values.push(value);
      }
    },
    subscribe: function () {
      if (!ref.current) {
        throw new Error("Canvas ref is not set");
      }
      if (values.length === 0) {
        return;
      }
      unsubscribe.push(ref.current.registerValues(values));
      values.splice(0, values.length);
    },
    unsubscribe: function () {
      if (unsubscribe.length === 0) {
        return;
      }
      unsubscribe.forEach((unsub) => unsub());
      unsubscribe.splice(0, unsubscribe.length);
    },
  };
};
