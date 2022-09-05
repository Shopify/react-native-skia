/*global NodeJS*/
import type { HostConfig } from "react-reconciler";

import type { NodeType, Node } from "../dom/types";

import type { Container } from "./Container";
import { createNode } from "./HostComponents";
import { exhaustiveCheck, shallowEq } from "./typeddash";
const DEBUG = false;
export const debug = (...args: Parameters<typeof console.log>) => {
  if (DEBUG) {
    console.log(...args);
  }
};

type Instance = Node<unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = any;
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
  //console.log(`appendNode ${parent.type} ${child.type}`);
  if (parent.isDrawing() && child.isPaint()) {
    parent.addPaint(child);
  } else if (parent.isGroup()) {
    if (child.isDeclaration()) {
      parent.addEffect(child);
    } else if (child.isGroup() || child.isDrawing()) {
      parent.addChild(child);
    }
  } else if (parent.isNestedDeclaration() && child.isDeclaration()) {
    parent.addChild(child);
  } else if (parent.isPaint() && child.isDeclaration()) {
    if (child.isColorFilter()) {
      parent.addColorFilter(child);
    } else if (child.isMaskFilter()) {
      parent.addMaskFilter(child);
    } else if (child.isShader()) {
      parent.addShader(child);
    } else if (child.isImageFilter()) {
      parent.addImageFilter(child);
    } else if (child.isPathEffect()) {
      parent.addPathEffect(child);
    } else {
      exhaustiveCheck(child);
    }
  } else {
    throw new Error(`Cannot append ${child.type} to ${parent.type}`);
  }
};
// TODO: handle node unsubscription
const removeNode = (parent: Node<unknown>, child: Node<unknown>) => {
  if (parent.isDrawing() && child.isPaint()) {
    parent.removePaint(child);
  }
  if (parent.isGroup()) {
    if (child.isDeclaration()) {
      parent.removeEffect(child);
    } else if (child.isDrawing()) {
      parent.removeChild(child);
    }
  } else if (parent.isNestedDeclaration() && child.isDeclaration()) {
    parent.removeChild(child);
  } else if (parent.isPaint() && child.isDeclaration()) {
    if (child.isColorFilter()) {
      parent.removeColorFilter();
    } else if (child.isMaskFilter()) {
      parent.removeMaskFilter();
    } else if (child.isShader()) {
      parent.removeShader();
    } else if (child.isImageFilter()) {
      parent.removeImageFilter();
    } else if (child.isPathEffect()) {
      parent.removePathEffect();
    } else {
      exhaustiveCheck(child);
    }
  } else {
    throw new Error(`Cannot remove ${child.type} from ${parent.type}`);
  }
};

const insertBefore = (
  parent: Node<unknown>,
  child: Node<unknown>,
  before: Node<unknown>
) => {
  if (parent.isDrawing() && child.isPaint() && before.isPaint()) {
    parent.insertPaintBefore(child, before);
  } else if (parent.isGroup() && child.isDrawing() && before.isDrawing()) {
    parent.insertChildBefore(child, before);
  } else if (
    parent.isNestedDeclaration() &&
    child.isDeclaration() &&
    before.isDeclaration()
  ) {
    parent.insertChildBefore(child, before);
  } else {
    throw new Error(
      `Cannot append ${child.type} to ${parent.type} before ${before.type}`
    );
  }
};

export const skHostConfig: SkiaHostConfig = {
  /**
   * This function is used by the reconciler in order to calculate current time for prioritising work.
   */
  now: Date.now,

  supportsMutation: true,
  isPrimaryRenderer: false,
  supportsPersistence: false,
  supportsHydration: false,
  //supportsMicrotask: true,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  appendChildToContainer(container, child) {
    debug("appendChildToContainer", container, child);
    appendNode(container.root, child);
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
    pristineProps,
    container,
    _hostContext,
    _internalInstanceHandle
  ) {
    debug("createInstance", type);
    const props = { ...pristineProps };
    const node = createNode(container, type, props);
    container.depMgr.subscribeNode(node, props);
    return node;
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

  finalizeContainerChildren: () => {
    debug("finalizeContainerChildren");
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
    updatePayload,
    type,
    prevProps,
    nextProps,
    _internalHandle
  ) {
    debug("commitUpdate: ", type);
    if (shallowEq(prevProps, nextProps)) {
      return;
    }
    const props = { ...nextProps };
    updatePayload.depMgr.unsubscribeNode(instance);
    instance.setProps(props);
    updatePayload.depMgr.subscribeNode(instance, props);
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
    container.clear();
  },

  preparePortalMount: () => {
    debug("preparePortalMount");
  },

  removeChild: (parent, child) => {
    removeNode(parent, child);
  },

  removeChildFromContainer: (container, child) => {
    removeNode(container.root, child);
  },

  insertInContainerBefore: (container, child, before) => {
    insertBefore(container.root, child, before);
  },

  insertBefore: (parent, child, before) => {
    insertBefore(parent, child, before);
  },
};
