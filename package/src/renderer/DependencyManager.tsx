import type { RefObject } from "react";

import type { SkiaView } from "../views";
import type { SkiaReadonlyValue } from "../values";

import { isValue } from "./processors";

type Unsubscribe = () => void;

export class DependencyManager {
  ref: RefObject<SkiaView>;
  values: SkiaReadonlyValue<unknown>[] = [];
  unsubscriptions: Unsubscribe[] = [];

  constructor(ref: RefObject<SkiaView>) {
    this.ref = ref;
  }

  addValues(props: { [key: string]: unknown }) {
    Object.values(props)
      .filter(isValue)
      .forEach((value) => {
        if (this.values.indexOf(value) === -1) {
          this.values.push(value);
        }
      });
  }

  subscribe() {
    console.log("SUBSCRIBE");
    if (!this.ref.current) {
      throw new Error("Canvas ref is not set");
    }
    this.unsubscriptions.push(this.ref.current.registerValues(this.values));
  }

  unsubscribe() {
    console.log("UNSUBSCRIBE");
    this.unsubscriptions.forEach((unsubscribe) => unsubscribe());
    this.unsubscriptions = [];
  }
}
