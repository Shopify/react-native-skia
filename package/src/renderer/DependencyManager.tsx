import type { RefObject } from "react";

import type { SkiaView } from "../views";
import type { SkiaReadonlyValue } from "../values";

import { isValue } from "./processors";

type Unsubscribe = () => void;

export class DependencyManager {
  ref: RefObject<SkiaView>;
  values: SkiaReadonlyValue<unknown>[] = [];
  unsub: Unsubscribe | null = null;

  constructor(ref: RefObject<SkiaView>) {
    this.ref = ref;
  }

  addValues(props: { [key: string]: unknown }) {
    console.log({ props });
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
    this.unsub = this.ref.current.registerValues(this.values);
  }

  unsubscribe() {
    if (this.unsub) {
      this.unsub();
      this.unsub = null;
      this.values = [];
    }
  }
}
