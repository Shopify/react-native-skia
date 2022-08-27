import type { SkiaValue } from "../values";

import type { Node } from "./nodes";
import type { AnimatedProps } from "./processors";
import { isSelector, isValue } from "./processors";
import { mapKeys } from "./typeddash";

type Unsubscribe = () => void;

type SubscriptionInfo = {
  value: SkiaValue<unknown>;
  key: string | symbol | number;
  listener: (s: unknown) => void;
};

type Subscription = {
  value: SkiaValue<unknown>;
  listeners: Array<(v: unknown) => void>;
  unsubscribe: null | Unsubscribe;
};

export class DependencyManager {
  registerValues: (values: Array<SkiaValue<unknown>>) => () => void;
  nodeSubscriptionInfos: Map<Node, SubscriptionInfo[]> = new Map();
  valueSubscriptions: Map<SkiaValue<unknown>, Subscription> = new Map();
  unregisterDependantValues: null | Unsubscribe = null;

  constructor(
    registerValues: (values: Array<SkiaValue<unknown>>) => () => void
  ) {
    this.registerValues = registerValues;
  }

  private createPropertySubscriptions<P extends Record<string, unknown>>(
    props: AnimatedProps<P>,
    onResolveProp: <K extends keyof P>(key: K, value: P[K]) => void
  ) {
    const nodePropSubscriptions: Array<{
      value: SkiaValue<unknown>;
      listener: (v: unknown) => void;
      key: string | symbol | number;
      unsub: (() => void) | undefined;
    }> = [];

    mapKeys(props).forEach((key) => {
      const propvalue = props[key];

      if (isValue(propvalue)) {
        // Subscribe to changes
        nodePropSubscriptions.push({
          key,
          value: propvalue,
          unsub: undefined,
          listener: (v) => onResolveProp(key, v as P[typeof key]),
        });
        // Set initial value
        onResolveProp(key, (propvalue as SkiaValue<P[typeof key]>).current);
      } else if (isSelector(propvalue)) {
        // Subscribe to changes
        nodePropSubscriptions.push({
          key,
          value: propvalue.value,
          unsub: undefined,
          listener: (v) =>
            onResolveProp(key, propvalue.selector(v) as P[typeof key]),
        });
        // Set initial value
        const v = propvalue.selector(propvalue.value.current) as P[typeof key];
        onResolveProp(key, v as P[typeof key]);
      } else {
        onResolveProp(key, propvalue as unknown as P[typeof key]);
      }
    });

    return nodePropSubscriptions.map((s) => ({
      value: s.value,
      listener: s.listener,
      key: s.key,
    }));
  }

  /**
   * Call to unsubscribe all value listeners from the given node based
   * on the current list of subscriptions for the node. This function
   * is typically called when the node is unmounted or when one or more
   * properties have changed.
   * @param node Node to unsubscribe value listeners from
   */
  unsubscribeNode(node: Node) {
    const subscriptions = this.nodeSubscriptionInfos.get(node);
    if (subscriptions) {
      subscriptions.forEach((si) => {
        // Remove from listeners in subscribed value
        this.valueSubscriptions.forEach((s) => {
          s.listeners = s.listeners.filter((l) => l !== si.listener);
        });

        // Remove subscription if there are no listeneres left on the value
        const valueSubscription = this.valueSubscriptions.get(si.value);
        if (valueSubscription && valueSubscription.listeners.length === 0) {
          // Unsubscribe
          if (!valueSubscription.unsubscribe) {
            throw new Error("Failed to unsubscribe to value subscription");
          }
          valueSubscription.unsubscribe && valueSubscription.unsubscribe();

          // Remove from value subscriptions
          if (!this.valueSubscriptions.delete(si.value)) {
            throw new Error("Failed to delete value subscription info");
          }
        }
      });

      // Remove node's subscription info
      if (!this.nodeSubscriptionInfos.delete(node)) {
        throw new Error("Failed to delete node subscription info");
      }

      // Remove node
      node.removeNode();
    }
  }

  /**
   * Adds listeners to the provided values so that the node is notified
   * when a value changes. This is done in an optimized way so that this
   * class only needs to listen to the value once and then forwards the
   * change to the node and its listener. This method is typically called
   * when the node is mounted and when one or more props on the node changes.
   * @param node Node to subscribe to value changes for
   * @param props Node's properties
   * @param onResolveProp Callback when a property value changes
   */
  subscribeNode<P extends Record<string, unknown>>(
    node: Node,
    props: AnimatedProps<P>,
    onResolveProp: <K extends keyof P>(key: K, value: P[K]) => void
  ) {
    const subscriptionInfos = this.createPropertySubscriptions(
      props,
      onResolveProp
    );
    if (subscriptionInfos.length === 0) {
      return;
    }
    // Install all subscriptions
    subscriptionInfos.forEach((si) => {
      // Do we already have this one as a unique value?
      let valueSubscription = this.valueSubscriptions.get(si.value);
      if (!valueSubscription) {
        // Subscribe to the value
        valueSubscription = {
          value: si.value,
          listeners: [],
          unsubscribe: null,
        };
        // Add single subscription to the new value
        valueSubscription.unsubscribe = si.value.addListener((v) => {
          valueSubscription!.listeners.forEach((listener) => listener(v));
        });
        this.valueSubscriptions.set(si.value, valueSubscription);
      }
      // Add listener
      valueSubscription.listeners.push(si.listener);
    });
    // Save node's subscription info as well
    this.nodeSubscriptionInfos.set(node, subscriptionInfos);
  }

  /**
   * Called when the hosting container is mounted or updated. This ensures that we have
   * a ref to the underlying SkiaView so that we can registers redraw listeners
   * on values used in the current View automatically.
   */
  update() {
    // Remove any previous registrations
    if (this.unregisterDependantValues) {
      this.unregisterDependantValues();
    }

    // Register redraw requests on the SkiaView for each unique value
    this.unregisterDependantValues = this.registerValues(
      Array.from(this.valueSubscriptions.keys())
    );
  }

  /**
   * Called when the hosting container is unmounted or recreated. This ensures that we remove
   * all subscriptions to Skia values so that we don't have any listeners left after
   * the component is removed.
   */
  remove() {
    // 1) Unregister redraw requests
    if (this.unregisterDependantValues) {
      this.unregisterDependantValues();
      this.unregisterDependantValues = null;
    }

    // 2) Unregister nodes
    this.nodeSubscriptionInfos.forEach((_, node) => this.unsubscribeNode(node));
    this.nodeSubscriptionInfos.clear();
    this.valueSubscriptions.clear();
  }
}
