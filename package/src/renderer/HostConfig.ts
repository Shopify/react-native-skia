/*global NodeJS*/
import type { HostConfig } from "react-reconciler";

import { NodeType } from "../dom/types";
import type { Node } from "../dom/types";

import "./HostComponents";

import type { Container } from "./Container";
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
type UpdatePayload = true;
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
  if (parent.isGroup()) {
    if (child.isDeclaration()) {
      parent.addEffect(child);
    } else if (child.isDrawing()) {
      parent.addChild(child);
    }
  } else if (parent.isNestedDeclaration() && child.isDeclaration()) {
    parent.addChild(child);
  } else if (parent.isDrawing() && child.isPaint()) {
    parent.addPaint(child);
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

const removeNode = (parent: Node<unknown>, child: Node<unknown>) => {
  if (parent.isGroup()) {
    if (child.isDeclaration()) {
      parent.removeEffect(child);
    } else if (child.isDrawing()) {
      parent.removeChild(child);
    }
  } else if (parent.isNestedDeclaration() && child.isDeclaration()) {
    parent.removeChild(child);
  } else if (parent.isDrawing() && child.isPaint()) {
    parent.removePaint(child);
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
  if (parent.isGroup() && child.isDrawing() && before.isDrawing()) {
    parent.insertChildBefore(child, before);
  } else if (
    parent.isNestedDeclaration() &&
    child.isDeclaration() &&
    before.isDeclaration()
  ) {
    parent.insertChildBefore(child, before);
  } else if (parent.isDrawing() && child.isPaint() && before.isPaint()) {
    parent.insertPaintBefore(child, before);
  } else {
    throw new Error(
      `Cannot append ${child.type} to ${parent.type} before ${before.type}`
    );
  }
};

const createNode = (container: Container, type: NodeType, props: Props) => {
  const { Sk } = container;
  switch (type) {
    case NodeType.Group:
      return Sk.Group(props);
    case NodeType.Paint:
      return Sk.Paint(props);
    // Drawings
    case NodeType.Fill:
      return Sk.Fill(props);
    case NodeType.Image:
      return Sk.Image(props);
    case NodeType.Circle:
      return Sk.Circle(props);
    case NodeType.Path:
      return Sk.Path(props);
    case NodeType.Drawing:
      return Sk.CustomDrawing(props);
    case NodeType.Line:
      return Sk.Line(props);
    case NodeType.Oval:
      return Sk.Oval(props);
    case NodeType.Patch:
      return Sk.Patch(props);
    case NodeType.Points:
      return Sk.Points(props);
    case NodeType.Rect:
      return Sk.Rect(props);
    case NodeType.RRect:
      return Sk.RRect(props);
    case NodeType.Vertices:
      return Sk.Vertices(props);
    case NodeType.Text:
      return Sk.Text(props);
    case NodeType.DiffRect:
      return Sk.DiffRect(props);
    // Mask Filter
    case NodeType.BlurMaskFilter:
      return Sk.BlurMaskFilter(props);
    // Image Filter
    case NodeType.BlendImageFilter:
      return Sk.BlendImageFilter(props);
    case NodeType.BlurImageFilter:
      return Sk.BlurImageFilter(props);
    case NodeType.OffsetImageFilter:
      return Sk.OffsetImageFilter(props);
    case NodeType.DropShadowImageFilter:
      return Sk.DropShadowImageFilter(props);
    case NodeType.DisplacementMapImageFilter:
      return Sk.DisplacementMapImageFilter(props);
    case NodeType.MorphologyImageFilter:
      return Sk.MorphologyImageFilter(props);
    case NodeType.RuntimeShaderImageFilter:
      return Sk.RuntimeShaderImageFilter(props);
    // Color Filter
    case NodeType.MatrixColorFilter:
      return Sk.MatrixColorFilter(props);
    // Shader
    case NodeType.Shader:
      return Sk.Shader(props);
    case NodeType.ImageShader:
      return Sk.ImageShader(props);
    case NodeType.LinearGradient:
      return Sk.LinearGradient(props);
    // Path Effect
    case NodeType.CornerPathEffect:
      return Sk.CornerPathEffect(props);
    default:
      return exhaustiveCheck(type);
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
    props,
    container,
    _hostContext,
    _internalInstanceHandle
  ) {
    debug("createInstance", type);
    return createNode(container, type, props);
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
    _rootContainerInstance,
    _hostContext
  ) => {
    debug("prepareUpdate");
    const propsAreEqual = shallowEq(oldProps, newProps);
    if (propsAreEqual) {
      return null;
    }
    debug("update ", type);
    return true;
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
    instance.setProps(nextProps);
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
