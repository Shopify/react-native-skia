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

let NodeID = 1000;

export abstract class Node<P = unknown> {
  readonly children: Node[] = [];
  _props: AnimatedProps<P>;
  _propSubscriptions: Array<{
    value: SkiaValue<unknown>;
    listener: (v: unknown) => void;
    key: string | symbol | number;
    unsub: (() => void) | undefined;
  }> = [];
  _dirty: Map<unknown, boolean> = new Map();
  memoizable = false;
  memoized: DeclarationResult | null = null;
  parent?: Node;
  depMgr: DependencyManager;
  nodeId: number;

  constructor(depMgr: DependencyManager, props: AnimatedProps<P>) {
    this.nodeId = NodeID++;
    //console.log("Node: constructor", this.nodeId);
    this.depMgr = depMgr;
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

  removeNode() {
    //console.log("Node: removeNode", this.nodeId);
    this.depMgr.unsubscribeNode(this);
    this._propSubscriptions = [];
  }

  subscribeToPropChanges(props: AnimatedProps<P>) {
    this._props = { ...props };
    this._propSubscriptions = [];
    mapKeys(this._props).forEach((key) => {
      const propvalue = this._props[key];
      if (isValue(propvalue)) {
        // Subscribe to changes
        this._propSubscriptions.push({
          key,
          value: propvalue,
          unsub: undefined,
          listener: (v) => {
            this._props[key] = v as P[typeof key];
            this.setDirty(key);
          },
        });
        // Set initial value
        this._props[key] = (propvalue as SkiaValue<P[typeof key]>).current;
      } else if (isIndexedAccess(propvalue)) {
        const i = propvalue.index;
        // Subscribe to changes
        this._propSubscriptions.push({
          key,
          value: propvalue.value,
          unsub: undefined,
          listener: (v) => {
            this._props[key] = (v as P[typeof key][])[i];
            this.setDirty(key);
          },
        });
        // Set initial value
        const v = propvalue.value.current[i];
        this._props[key] = v as P[typeof key];
      }
    });

    this._propSubscriptions.length > 0 &&
      // console.log(
      //   "Node: subscribeToPropChanges set",
      //   this.nodeId,
      //   this._propSubscriptions.map((p) => p.key).join(",")
      // );

      // Subscribe to properties
      this.depMgr.subscribeNode(
        this,
        this._propSubscriptions.map((s) => ({
          value: s.value,
          listener: s.listener,
          key: s.key,
        }))
      );

    // returns props - this is just so that the ctor type logic is working :)
    return this._props;
  }

  set props(props: AnimatedProps<P>) {
    //console.log("Node: props set", this.nodeId);
    this.depMgr.unsubscribeNode(this);
    this.subscribeToPropChanges(props);
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
