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

  private registerValues(props: AnimatedProps<P>) {
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

export class Container extends Node {
  ref: RefObject<SkiaView>;

  redraw: () => void;

  constructor(ref: RefObject<SkiaView>, redraw: () => void) {
    super(ref.current!.registerValues, {});
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
