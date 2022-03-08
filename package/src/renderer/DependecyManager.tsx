import type { RefObject } from "react";

import type { SkiaView } from "../views";
import type { SkiaReadonlyValue } from "../values";

import type { SkNode } from "./Host";
import { isValue, processProps } from "./processors";

export const createDependencyManager = (ref: RefObject<SkiaView>) => {
  const values: SkiaReadonlyValue<unknown>[] = [];
  const unsubscribe: Array<() => void> = [];

  return {
    visitChildren: function (node: SkNode<unknown>) {
      processProps(node.props, (value) => {
        if (isValue(value)) {
          this.registerValue(value);
        }
      });
      node.children.forEach((c) => this.visitChildren(c));
    },
    registerValue: function <T>(value: SkiaReadonlyValue<T>) {
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
