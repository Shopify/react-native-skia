import type { SkJSIInstance } from "../../skia/types";
import type { SkiaValue } from "../../values";
import type { DependencyManager } from "../DependencyManager";
import type { DrawingContext } from "../DrawingContext";
import type { AnimatedProps } from "../processors";
import { isIndexedAccess, isValue } from "../processors";
import { mapKeys } from "../typeddash";

export enum NodeType {
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

type DeclarationResult = SkJSIInstance<string> | null;

export abstract class Node<P = unknown> {
  readonly children: Node[] = [];
  _props: AnimatedProps<P>;
  _propSubscriptions: Array<{
    unsub: () => void;
    key: string | symbol | number;
  }> = [];
  _dirty: Map<unknown, boolean> = new Map();
  memoizable = false;
  memoized: DeclarationResult | null = null;
  parent?: Node;
  depMgr: DependencyManager;

  constructor(depMgr: DependencyManager, props: AnimatedProps<P>) {
    this.depMgr = depMgr;
    this.depMgr.unsubscribeNode(this);
    this.depMgr.subscribeNode(this, props);
    this._props = this.subscribeToPropChanges(props);
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  resetDirtyFlags() {
    this._dirty.clear();
  }

  setDirty(key: keyof P) {
    this._dirty.set(key, true);
  }

  isDirty(...keys: Array<keyof P>) {
    return keys.reduce(
      (acc, key) => (acc || this._dirty.get(key)) ?? false,
      false
    );
  }

  unmountNode() {
    this.unsubscribeToPropChanges();
  }

  unsubscribeToPropChanges() {
    if (this._propSubscriptions.length === 0) {
      return;
    }
    this._propSubscriptions.forEach((p) => p.unsub());
    this._propSubscriptions = [];
  }

  subscribeToPropChanges(props: AnimatedProps<P>) {
    this.unsubscribeToPropChanges();
    this._props = { ...props };
    mapKeys(this._props).forEach((key) => {
      const propvalue = this._props[key];
      if (isValue(propvalue)) {
        // Subscribe to changes
        this._propSubscriptions.push({
          key,
          unsub: propvalue.addListener((v) => {
            this._props[key] = v as P[typeof key];
            this.setDirty(key);
          }),
        });
        // Set initial value
        this._props[key] = (propvalue as SkiaValue<P[typeof key]>).current;
      } else if (isIndexedAccess(propvalue)) {
        const i = propvalue.index;
        // Subscribe to changes
        this._propSubscriptions.push({
          key,
          unsub: propvalue.value.addListener((v) => {
            this._props[key] = v[i] as P[typeof key];
            this.setDirty(key);
          }),
        });
        // Set initial value
        const v = propvalue.value.current[i];
        this._props[key] = v as P[typeof key];
      }
    });
    return this._props;
  }

  set props(props: AnimatedProps<P>) {
    this.depMgr.unsubscribeNode(this);
    this.depMgr.subscribeNode(this, props);
    this._props = this.subscribeToPropChanges(props);
  }

  get props() {
    return this._props;
  }

  visit(ctx: DrawingContext, children?: Node[]) {
    const returnedValues: Exclude<DeclarationResult, null>[] = [];
    (children ?? this.children).forEach((child) => {
      if (child.memoized && child.memoizable) {
        returnedValues.push(child.memoized);
      } else {
        const ret = child.draw(ctx);
        child.resetDirtyFlags();
        if (ret) {
          returnedValues.push(ret);
          if (child.memoizable) {
            child.memoized = ret;
          }
        }
      }
    });
    this.resetDirtyFlags();
    return returnedValues;
  }
}
