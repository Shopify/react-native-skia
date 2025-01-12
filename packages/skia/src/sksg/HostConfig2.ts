/*global NodeJS*/
import type { Fiber, HostConfig } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

import type { NodeType } from "../dom/types";
import { shallowEq } from "../renderer/typeddash";

import type { Container } from "./Container";
import type { Node } from "./Node";

const DEBUG = false;
export const debug = (...args: Parameters<typeof console.log>) => {
  if (DEBUG) {
    console.log(...args);
  }
};

type Instance = Node<unknown>;

type Props = object;
type TextInstance = Node<unknown>;
type SuspenseInstance = Instance;
type HydratableInstance = Instance;
type PublicInstance = Instance;
type HostContext = null;
type UpdatePayload = Container;
type ChildSet = unknown;
type TimeoutHandle = NodeJS.Timeout;
type NoTimeout = -1;

type SkiaHostConfig = HostConfig<
  NodeType,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
>;

const appendNode = (parent: Node<unknown>, child: Node<unknown>) => {
  parent.children.push(child);
};

const removeNode = (parent: Node<unknown>, child: Node<unknown>) => {
  parent.children.splice(parent.children.indexOf(child), 1);
};

const insertBefore = (
  parent: Node<unknown>,
  child: Node<unknown>,
  before: Node<unknown>
) => {
  parent.children.splice(parent.children.indexOf(before), 0, child);
};

export const sksgHostConfig: SkiaHostConfig = {
  /**
   * This function is used by the reconciler in order to calculate current time for prioritising work.
   */
  supportsMutation: true,
  isPrimaryRenderer: false,
  supportsPersistence: false,
  supportsHydration: false,
  //supportsMicrotask: true,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  appendChildToContainer(container, child) {
    debug("appendChildToContainer");
    container.root.push(child);
  },

  appendChild(parent, child) {
    debug("appendChild", parent, child);
    appendNode(parent, child);
  },

  getRootHostContext: (_rootContainerInstance: Container) => {
    debug("getRootHostContext");
    return null;
  },

  getChildHostContext(_parentHostContext, _type, _rootContainerInstance) {
    debug("getChildHostContext");
    return null;
  },

  shouldSetTextContent(_type, _props) {
    return false;
  },

  createTextInstance(
    _text,
    _rootContainerInstance,
    _hostContext,
    _internalInstanceHandle
  ) {
    debug("createTextInstance");
    // return SpanNode({}, text) as SkNode;
    throw new Error("Text nodes are not supported yet");
  },

  createInstance(
    type,
    propsWithChildren,
    _container,
    _hostContext,
    _internalInstanceHandle
  ) {
    debug("createInstance", type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { children, ...props } = propsWithChildren as any;
    debug("createInstance", type);
    const instance = {
      type,
      props,
      children: [],
    };
    return instance;
  },

  appendInitialChild(parentInstance, child) {
    debug("appendInitialChild");
    appendNode(parentInstance, child);
  },

  finalizeInitialChildren(
    parentInstance,
    _type,
    _props,
    _rootContainerInstance,
    _hostContext
  ) {
    debug("finalizeInitialChildren", parentInstance);
    return false;
  },

  commitMount() {
    // if finalizeInitialChildren = true
    debug("commitMount");
  },

  prepareForCommit(_containerInfo) {
    debug("prepareForCommit");
    return null;
  },

  resetAfterCommit(container) {
    debug("resetAfterCommit");
    container.redraw();
  },

  getPublicInstance(node: Instance) {
    debug("getPublicInstance");
    return node;
  },

  prepareUpdate: (
    _instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    _hostContext
  ) => {
    debug("prepareUpdate");
    const propsAreEqual = shallowEq(oldProps, newProps);
    if (propsAreEqual) {
      return null;
    }
    debug("update ", type);
    return rootContainerInstance;
  },

  commitUpdate(
    instance,
    _updatePayload,
    type,
    prevProps,
    nextProps,
    _internalHandle
  ) {
    debug("commitUpdate: ", type);
    if (shallowEq(prevProps, nextProps)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { children, ...props } = nextProps as any;
    instance.props = props;
  },

  commitTextUpdate: (
    _textInstance: TextInstance,
    _oldText: string,
    _newText: string
  ) => {
    //  textInstance.instance = newText;
  },

  clearContainer: (container) => {
    debug("clearContainer");
    container.root = [];
  },

  preparePortalMount: () => {
    debug("preparePortalMount");
  },

  removeChild: (parent, child) => {
    removeNode(parent, child);
  },

  removeChildFromContainer: (container, child) => {
    container.root.splice(container.root.indexOf(child), 1);
  },

  insertInContainerBefore: (container, child, before) => {
    container.root.splice(container.root.indexOf(before), 0, child);
  },

  insertBefore: (parent, child, before) => {
    insertBefore(parent, child, before);
  },

  // see https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r916356874
  getCurrentEventPriority: () => DefaultEventPriority,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},

  getInstanceFromNode: function (_node): Fiber | null | undefined {
    return null;
  },
  prepareScopeUpdate: function (_scopeInstance, _instance): void {},
  getInstanceFromScope: function (_scopeInstance): Instance | null {
    return null;
  },
};
