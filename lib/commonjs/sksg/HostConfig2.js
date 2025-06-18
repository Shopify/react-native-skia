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
const appendNode = (parent, child) => {
  parent.children.push(child);
};
const removeNode = (parent, child) => {
  parent.children.splice(parent.children.indexOf(child), 1);
};
const insertBefore = (parent, child, before) => {
  parent.children.splice(parent.children.indexOf(before), 0, child);
};
const sksgHostConfig = exports.sksgHostConfig = {
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
    debug("createInstance", type);
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
    debug("appendInitialChild");
    appendNode(parentInstance, child);
  },
  finalizeInitialChildren(parentInstance, _type, _props, _rootContainerInstance, _hostContext) {
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
  getPublicInstance(node) {
    debug("getPublicInstance");
    return node;
  },
  prepareUpdate: (_instance, type, oldProps, newProps, rootContainerInstance, _hostContext) => {
    debug("prepareUpdate");
    const propsAreEqual = (0, _typeddash.shallowEq)(oldProps, newProps);
    if (propsAreEqual) {
      return null;
    }
    debug("update ", type);
    return rootContainerInstance;
  },
  commitUpdate(instance, _updatePayload, type, prevProps, nextProps, _internalHandle) {
    debug("commitUpdate: ", type);
    if ((0, _typeddash.shallowEq)(prevProps, nextProps)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {
      children,
      ...props
    } = nextProps;
    instance.props = props;
  },
  commitTextUpdate: (_textInstance, _oldText, _newText) => {
    //  textInstance.instance = newText;
  },
  clearContainer: container => {
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
  getCurrentEventPriority: () => _constants.DefaultEventPriority,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},
  getInstanceFromNode: function (_node) {
    return null;
  },
  prepareScopeUpdate: function (_scopeInstance, _instance) {},
  getInstanceFromScope: function (_scopeInstance) {
    return null;
  }
};
//# sourceMappingURL=HostConfig2.js.map