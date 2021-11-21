/*global NodeJS, performance*/
import type { HostConfig } from "react-reconciler";
import type { CanvasKit } from "canvaskit-wasm";
import _ from "lodash";

import { exhaustiveCheck } from "../exhaustiveCheck";

import {
  CircleNode,
  FillNode,
  GroupNode,
  BlurNode,
  PaintNode,
  RadialGradientNode,
  LinearGradientNode,
  RectNode,
  ImageShaderNode,
  ImageNode,
  ShaderNode,
  RuntimeEffectNode,
  PathNode,
  LineNode,
  DropShadowNode,
  ColorMatrixNode,
  DrawingNode,
  ParagraphNode,
  TextNode,
} from "./nodes";
import type {
  BlurProps,
  RadialGradientProps,
  LinearGradientProps,
  CircleProps,
  FillProps,
  GroupProps,
  PaintProps,
  RectProps,
  ImageShaderProps,
  ImageProps,
  ShaderProps,
  RuntimeEffectProps,
  PathProps,
  LineProps,
  DropShadowProps,
  ColorMatrixProps,
  DrawingProps,
  ParagraphProps,
  SpanProps,
  TextProps,
} from "./nodes";
import type { SkContainer, SkNode, NodeProps } from "./Host";
import { NodeType } from "./Host";
import { SpanNode } from "./nodes/text/Text";

const DEBUG = false;
export const debug = (...args: Parameters<typeof console.log>) => {
  if (DEBUG) {
    console.log(...args);
  }
};

type Instance = SkNode;
type Props = NodeProps[NodeType];
type TextInstance = SkNode;
type SuspenseInstance = Instance;
type HydratableInstance = Instance;
type PublicInstance = Instance["instance"];
type HostContext = null;
type UpdatePayload = true;
type ChildSet = unknown;
type TimeoutHandle = NodeJS.Timeout;
type NoTimeout = -1;

type SkiaHostConfig = HostConfig<
  NodeType,
  Props,
  SkContainer,
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

const typedKeys = <O>(o: O) => Object.keys(o) as (keyof O)[];

// The goal of this customEq is to make sure that that JSI instances with different identities have the same deep
// equality (because the function doesn't see the hidden data).
// This function might be tested more
// const customEq = (oldVal: unknown, newVal: unknown) => {
//   if (_.isObject(oldVal) && _.isObject(newVal) && !_.isPlainObject(oldVal)) {
//     return newVal === oldVal;
//   }
//   return undefined;
// };

// Shallow eq on props (without children)
const shallowEq = <P extends Props>(p1: P, p2: P): boolean => {
  const keys1 = typedKeys(p1);
  const keys2 = typedKeys(p2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (key === "children") {
      continue;
    }

    // TODO: This deep data eq needs to be tested more
    // the biggest concern is that the JSI instances have different identities
    // and are not caught by a deep data eq
    // !_.isEqualWith(p1[key], p2[key], customEq)
    // use p1[key] !== p2[key] for a more basic identity check
    if (p1[key] !== p2[key]) {
      return false;
    }
  }
  return true;
};

const allChildrenAreMemoized = (node: Instance) => {
  if (!node.memoizable) {
    return false;
  }
  for (const child of node.children) {
    if (!child.memoized) {
      return false;
    }
  }
  return true;
};

const bustBranchMemoization = (parent: SkNode) => {
  if (parent.memoizable) {
    let ancestor: SkNode | undefined = parent;
    while (ancestor) {
      ancestor.memoized = false;
      ancestor = ancestor.parent;
    }
  }
};

const appendNode = (parent: SkNode, child: SkNode) => {
  if (parent.memoizable) {
    child.parent = parent;
  }
  bustBranchMemoization(parent);
  parent.children.push(child);
};

const removeNode = (parent: SkNode, child: SkNode) => {
  bustBranchMemoization(parent);
  const index = parent.children.indexOf(child);
  parent.children.splice(index, 1);
};

const insertBefore = (parent: SkNode, child: SkNode, before: SkNode) => {
  bustBranchMemoization(parent);
  const index = parent.children.indexOf(child);
  if (index !== -1) {
    parent.children.splice(index, 1);
  }
  const beforeIndex = parent.children.indexOf(before);
  parent.children.splice(beforeIndex, 0, child);
};

const createNode = (CanvasKit: CanvasKit, type: NodeType, props: Props) => {
  switch (type) {
    case NodeType.Canvas:
      throw new Error("Cannot create canvas node");
    case NodeType.Group:
      return GroupNode(props as GroupProps);
    case NodeType.Circle:
      return CircleNode(props as CircleProps);
    case NodeType.Rect:
      return RectNode(props as RectProps);
    case NodeType.Path:
      return PathNode(props as PathProps);
    case NodeType.Line:
      return LineNode(props as LineProps);
    case NodeType.Drawing:
      return DrawingNode(props as DrawingProps);
    case NodeType.Fill:
      return FillNode(props as FillProps);
    case NodeType.Paint:
      const paint = new CanvasKit.Paint();
      paint.setAntiAlias(true);
      return PaintNode(props as PaintProps, paint);
    case NodeType.ColorMatrix:
      return ColorMatrixNode(props as ColorMatrixProps);
    case NodeType.RadialGradient:
      return RadialGradientNode(props as RadialGradientProps);
    case NodeType.LinearGradient:
      return LinearGradientNode(props as LinearGradientProps);
    case NodeType.Blur:
      return BlurNode(props as BlurProps);
    case NodeType.Image:
      return ImageNode(props as ImageProps);
    case NodeType.ImageShader:
      return ImageShaderNode(props as ImageShaderProps);
    case NodeType.DropShadow:
      return DropShadowNode(props as DropShadowProps);
    case NodeType.RuntimeEffect:
      // TODO: move instance creation to finalize children?
      const rtProps = props as RuntimeEffectProps;
      const rt = CanvasKit.RuntimeEffect.Make(rtProps.source);
      if (!rt) {
        throw new Error("Couldn't compile RT");
      }
      return RuntimeEffectNode(rtProps, rt);
    case NodeType.Shader:
      return ShaderNode(props as ShaderProps);
    case NodeType.Paragraph:
      return ParagraphNode(props as ParagraphProps);
    case NodeType.Text:
      return TextNode(props as TextProps);
    case NodeType.Span:
      return SpanNode(props as SpanProps);
    default:
      // TODO: here we need to throw a nice error message
      // This is the error that will show up when the user uses nodes not supported by Skia (View, Audio, etc)
      return exhaustiveCheck(type);
  }
};

export const skHostConfig: SkiaHostConfig = {
  /**
   * This function is used by the reconciler in order to calculate current time for prioritising work.
   */
  now: performance.now,

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
    appendNode(container, child);
  },

  appendChild(parent, child) {
    debug("appendChild", parent, child);
    appendNode(parent, child);
  },

  getRootHostContext: (_rootContainerInstance: SkNode) => {
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
    text,
    _rootContainerInstance,
    _hostContext,
    _internalInstanceHandle
  ) {
    debug("createTextInstance");
    return SpanNode({}, text) as SkNode;
  },

  createInstance(type, props, root, _hostContext, _internalInstanceHandle) {
    debug("createInstance", type);
    return createNode(root.CanvasKit, type, props) as SkNode;
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
    return node.instance;
  },

  prepareUpdate: (
    instance,
    type,
    oldProps,
    newProps,
    _rootContainerInstance,
    _hostContext
  ) => {
    debug("prepareUpdate");
    const propsAreEqual = shallowEq(oldProps, newProps);
    if (propsAreEqual && !instance.memoizable) {
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
    if (shallowEq(prevProps, nextProps) && allChildrenAreMemoized(instance)) {
      return;
    }
    instance.memoized = false;
    instance.props = nextProps;
  },

  commitTextUpdate: (
    textInstance: TextInstance,
    _oldText: string,
    newText: string
  ) => {
    textInstance.instance = newText;
  },

  clearContainer: (container) => {
    debug("clearContainer");
    container.children.splice(0);
  },

  preparePortalMount: () => {
    debug("preparePortalMount");
  },

  removeChild: (parent, child) => {
    removeNode(parent, child);
  },

  removeChildFromContainer: (parent, child) => {
    removeNode(parent, child);
  },

  insertInContainerBefore: (parent, child, before) => {
    insertBefore(parent, child, before);
  },

  insertBefore: (parent, child, before) => {
    insertBefore(parent, child, before);
  },
};
