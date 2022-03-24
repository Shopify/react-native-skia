import type { RefObject } from "react";

import { isPaint } from "../skia/Paint/Paint";
import type { SkiaReadonlyValue } from "../values";
import type { SkiaView } from "../views";

import type { DrawingContext } from "./DrawingContext";
import type { DeclarationResult, DeclarationProps } from "./nodes/Declaration";
import type { DrawingProps } from "./nodes";
import type { AnimatedProps } from "./processors/Animations/Animations";
import { isValue } from "./processors/Animations/Animations";

export enum NodeType {
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

type Unsubscription = () => void;
export type ValueRegistration = (
  values: SkiaReadonlyValue<unknown>[]
) => Unsubscription;

export abstract class Node<P = unknown> {
  readonly children: Node[] = [];
  _props: AnimatedProps<P>;
  memoizable = false;
  memoized = false;
  parent?: Node;

  private valueRegistration: ValueRegistration;
  private unsubscriptions: Unsubscription | null = null;

  protected registerValues(props: AnimatedProps<P>) {
    if (this.unsubscriptions) {
      this.unsubscriptions();
    }
    this.unsubscriptions = this.valueRegistration(
      Object.values(props).filter(isValue)
    );
  }

  constructor(valueRegistration: ValueRegistration, props: AnimatedProps<P>) {
    this.valueRegistration = valueRegistration;
    this.registerValues(props);
    this._props = props;
  }

  dispose() {
    if (this.unsubscriptions) {
      this.unsubscriptions();
    }
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  set props(props: AnimatedProps<P>) {
    this.registerValues(props);
    this._props = props;
  }

  get props() {
    return this._props;
  }

  visit(ctx: DrawingContext) {
    const returnedValues: Exclude<DeclarationResult, null>[] = [];
    let currentCtx = ctx;
    this.children.forEach((child) => {
      if (!child.memoized) {
        const ret = child.draw(currentCtx);
        if (ret) {
          if (isPaint(ret)) {
            currentCtx = { ...currentCtx, paint: ret };
          }
          returnedValues.push(ret);
        }
        if (child.memoizable) {
          child.memoized = true;
        }
      }
    });
    return returnedValues;
  }
}

type PendingValueRegistration = {
  values: SkiaReadonlyValue<unknown>[];
  unsubscribe: null | Unsubscription;
};

export class Container extends Node {
  ref: RefObject<SkiaView>;

  // When mounting the tree the first time, the skia view is not yet available.
  // We will delay registrations when the tree is ready in create()
  private pending: PendingValueRegistration[] = [];
  redraw: () => void;

  skiaValueRegistration: ValueRegistration = (
    values: SkiaReadonlyValue<unknown>[]
  ) => {
    // 1. No props are animated. Do nothing.
    if (values.length === 0) {
      return () => {};
    }
    // 2. The skia view is already available
    if (this.ref.current) {
      return this.ref.current.registerValues(values);
    }
    // 3. The skia view is not available yet. We keep track of the values to register in create()
    const valueReg: PendingValueRegistration = { values, unsubscribe: null };
    this.pending.push(valueReg);
    return () => {
      if (valueReg.unsubscribe !== null) {
        valueReg.unsubscribe();
        this.pending.splice(this.pending.indexOf(valueReg), 1);
      } else {
        throw new Error(
          "We tried to unregister a value that wasn't registered"
        );
      }
    };
  };

  create() {
    this.pending.forEach((registration) => {
      if (this.ref.current) {
        registration.unsubscribe = this.ref.current.registerValues(
          registration.values
        );
      } else {
        throw new Error(
          "Tried to registered animation values Skia View ref was null."
        );
      }
    });
  }

  dispose() {
    this.pending.forEach((sub) => sub.unsubscribe!());
  }

  constructor(ref: RefObject<SkiaView>, redraw: () => void) {
    super(() => () => {}, {});
    this.ref = ref;
    this.redraw = redraw;
  }

  draw(ctx: DrawingContext) {
    this.visit(ctx);
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      skDeclaration: DeclarationProps<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      skDrawing: DrawingProps<any>;
    }
  }
}
