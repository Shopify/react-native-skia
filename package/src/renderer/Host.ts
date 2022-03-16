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

export abstract class SkNode<P> {
  readonly children: SkNode<unknown>[] = [];
  _props: AnimatedProps<P>;
  memoizable = false;
  memoized = false;
  parent?: SkNode<unknown>;

  constructor(props: AnimatedProps<P>) {
    this._props = props;
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  set props(props: AnimatedProps<P>) {
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

export class Container extends SkNode<unknown> {
  values: SkiaReadonlyValue<unknown>[] = [];
  subscription: (() => void) | null = null;
  redraw: () => void;
  ref: RefObject<SkiaView>;

  constructor(ref: RefObject<SkiaView>, redraw: () => void) {
    super({});
    this.ref = ref;
    this.redraw = redraw;
  }

  draw(ctx: DrawingContext) {
    this.visit(ctx);
  }

  registerValues(props: { [s: string]: unknown }) {
    Object.values(props).forEach((value) => {
      if (isValue(value)) {
        this.values.push(value);
      }
    });
  }

  subscribe() {
    if (!this.ref.current) {
      throw new Error("Canvas ref is not set");
    }
    if (this.values.length === 0) {
      return;
    }
    this.subscription = this.ref.current.registerValues(this.values);
    this.values.splice(0, this.values.length);
  }

  unsubscribe() {
    if (this.subscription !== null) {
      this.subscription();
      this.subscription = null;
    }
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
