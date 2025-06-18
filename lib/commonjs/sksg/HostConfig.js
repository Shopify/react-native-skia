"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sksgHostConfig = exports.debug = void 0;
var _constants = require("react-reconciler/constants");
var _typeddash = require("../renderer/typeddash");
/*global NodeJS*/

const DEBUG = false;
const debug = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};
exports.debug = debug;
const sksgHostConfig = exports.sksgHostConfig = {
  /**
   * This function is used by the reconciler in order to calculate current time for prioritising work.
   */
  supportsMutation: false,
  isPrimaryRenderer: false,
  supportsPersistence: true,
  supportsHydration: false,
  //supportsMicrotask: true,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  getRootHostContext: _rootContainerInstance => {
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
  createTextInstance(_text, _rootContainerInstance, _hostContext, _internalInstanceHandle) {
    debug("createTextInstance");
    // return SpanNode({}, text) as SkNode;
    throw new Error("Text nodes are not supported yet");
  },
  createInstance(type, propsWithChildren, _container, _hostContext, _internalInstanceHandle) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {
      children,
      ...props
    } = propsWithChildren;
    debug("createInstance", type);
    const instance = {
      type,
      props,
      children: []
    };
    return instance;
  },
  appendInitialChild(parentInstance, child) {
    parentInstance.children.push(child);
  },
  finalizeInitialChildren(parentInstance, _type, _props, _rootContainerInstance, _hostContext) {
    debug("finalizeInitialChildren", parentInstance);
    return false;
  },
  commitMount() {
    // if finalizeInitialChildren = true
    debug("commitMount");
  },
  prepareForCommit(_container) {
    debug("prepareForCommit");
    return null;
  },
  resetAfterCommit(container) {
    debug("resetAfterCommit");
    container.redraw();
  },
  getPublicInstance(node) {
    debug("getPublicInstance");
    return node;
  },
  commitTextUpdate: (_textInstance, _oldText, _newText) => {
    //  textInstance.instance = newText;
  },
  clearContainer: _container => {
    debug("clearContainer");
  },
  prepareUpdate(_instance, _type, oldProps, newProps, container, _hostContext) {
    debug("prepareUpdate");
    const propsAreEqual = (0, _typeddash.shallowEq)(oldProps, newProps);
    if (propsAreEqual) {
      return null;
    }
    return container;
  },
  preparePortalMount: () => {
    debug("preparePortalMount");
  },
  cloneInstance(instance, _updatePayload, _type, _oldProps, newProps, _internalInstanceHandle, keepChildren, _recyclableInstance) {
    debug("cloneInstance");
    return {
      type: instance.type,
      props: {
        ...newProps
      },
      children: keepChildren ? [...instance.children] : []
    };
  },
  createContainerChildSet() {
    debug("createContainerChildSet");
    return [];
  },
  appendChildToContainerChildSet(childSet, child) {
    childSet.push(child);
  },
  finalizeContainerChildren(container, newChildren) {
    debug("finalizeContainerChildren");
    container.root = newChildren;
  },
  replaceContainerChildren(container, newChildren) {
    container.root = newChildren;
  },
  cloneHiddenInstance(_instance, _type, _props) {
    debug("cloneHiddenInstance");
    throw new Error("Not yet implemented.");
  },
  cloneHiddenTextInstance(_instance, _text) {
    debug("cloneHiddenTextInstance");
    throw new Error("Not yet implemented.");
  },
  // see https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r916356874
  getCurrentEventPriority: () => _constants.DefaultEventPriority,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: _node => {},
  getInstanceFromNode: function (_node) {
    throw new Error("Function not implemented.");
  },
  prepareScopeUpdate: function (_scopeInstance, _instance) {
    throw new Error("Function not implemented.");
  },
  getInstanceFromScope: function (_scopeInstance) {
    throw new Error("Function not implemented.");
  }
};
//# sourceMappingURL=HostConfig.js.map