/*global NodeJS*/
import type { HostConfig } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

import { NodeType } from "../dom/types";
import type { AnimatedProps } from "../renderer";
import Rea from "../external/reanimated/ReanimatedProxy";

import type { Node } from "./Node";
import type { Container } from "./Container";

const DEBUG = false;
export const debug = (...args: Parameters<typeof console.log>) => {
  if (DEBUG) {
    console.log(...args);
  }
};

const isDeclaration = (type: NodeType) => {
  "worklet";
  return (
    // BlurMaskFilters
    type === NodeType.BlurMaskFilter ||
    // ImageFilters
    type === NodeType.BlendImageFilter ||
    type === NodeType.BlurImageFilter ||
    type === NodeType.OffsetImageFilter ||
    type === NodeType.DropShadowImageFilter ||
    type === NodeType.MorphologyImageFilter ||
    type === NodeType.DisplacementMapImageFilter ||
    type === NodeType.RuntimeShaderImageFilter ||
    // ColorFilters
    type === NodeType.MatrixColorFilter ||
    type === NodeType.BlendColorFilter ||
    type === NodeType.LumaColorFilter ||
    type === NodeType.LinearToSRGBGammaColorFilter ||
    type === NodeType.SRGBToLinearGammaColorFilter ||
    type === NodeType.LerpColorFilter ||
    // Shaders
    type === NodeType.Shader ||
    type === NodeType.ImageShader ||
    type === NodeType.ColorShader ||
    type === NodeType.Turbulence ||
    type === NodeType.FractalNoise ||
    type === NodeType.LinearGradient ||
    type === NodeType.RadialGradient ||
    type === NodeType.SweepGradient ||
    type === NodeType.TwoPointConicalGradient ||
    // Path Effects
    type === NodeType.CornerPathEffect ||
    type === NodeType.DiscretePathEffect ||
    type === NodeType.DashPathEffect ||
    type === NodeType.Path1DPathEffect ||
    type === NodeType.Path2DPathEffect ||
    type === NodeType.SumPathEffect ||
    type === NodeType.Line2DPathEffect ||
    // Mixed
    type === NodeType.Blend ||
    type === NodeType.BoxShadow ||
    // Paint
    type === NodeType.Paint
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const materialize = (props: AnimatedProps<any>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherProps = {} as AnimatedProps<any>;
  for (const propName in props) {
    if (propName === "children") {
      continue;
    }
    const propValue = props[propName];
    if (Rea.isSharedValue(propValue)) {
      otherProps[propName] = propValue.value;
    } else {
      otherProps[propName] = propValue;
    }
  }
  return otherProps;
};

type Instance = Node;

type Props = object;
type TextInstance = Node;
type SuspenseInstance = Instance;
type HydratableInstance = Instance;
type PublicInstance = Instance;
type HostContext = null;
type UpdatePayload = Container;
type ChildSet = Node[];
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

export const sksgHostConfig: SkiaHostConfig = {
  /**
   * This function is used by the reconciler in order to calculate current time for prioritising work.
   */
  now: Date.now,
  supportsMutation: false,
  isPrimaryRenderer: false,
  supportsPersistence: true,
  supportsHydration: false,
  //supportsMicrotask: true,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

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
    _container,
    _hostContext,
    _internalInstanceHandle
  ) {
    debug("createInstance", type);
    return {
      type,
      isDeclaration: isDeclaration(type),
      props: materialize(props),
      children: [],
    };
  },

  appendInitialChild(parentInstance: Instance, child: Instance | TextInstance) {
    parentInstance.children.push(child);
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

  cloneInstance(
    instance: Instance,
    type: string,
    _oldProps: Props,
    newProps: Props,
    keepChildren: boolean,
    newChildSet?: ChildSet
  ) {
    console.log({ cloneInstance: { type } });
    return {
      type: instance.type,
      props: materialize(newProps),
      children: keepChildren ? instance.children : newChildSet ?? [],
    };
  },

  createContainerChildSet(): ChildSet {
    debug("createContainerChildSet");
    return [];
  },

  appendChildToContainerChildSet(
    childSet: ChildSet,
    child: Instance | TextInstance
  ): void {
    childSet.push(child);
  },

  finalizeContainerChildren(container: Container, newChildren: ChildSet) {
    debug("finalizeContainerChildren");
    container.root = newChildren;
  },

  replaceContainerChildren(container: Container, newChildren: ChildSet) {
    debug("replaceContainerChildren");
    container.root = newChildren;
  },

  cloneHiddenInstance(
    _instance: Instance,
    _type: string,
    _props: Props
  ): Instance {
    debug("cloneHiddenInstance");
    throw new Error("Not yet implemented.");
  },
  cloneHiddenTextInstance(_instance: Instance, _text: string): TextInstance {
    debug("cloneHiddenTextInstance");
    throw new Error("Not yet implemented.");
  },
  // see https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r916356874
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  getCurrentEventPriority: () => DefaultEventPriority,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},
};
