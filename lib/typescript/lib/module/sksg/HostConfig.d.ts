export function debug(...args: any[]): void;
export namespace sksgHostConfig {
    let supportsMutation: boolean;
    let isPrimaryRenderer: boolean;
    let supportsPersistence: boolean;
    let supportsHydration: boolean;
    let scheduleTimeout: typeof setTimeout;
    let cancelTimeout: typeof clearTimeout;
    let noTimeout: number;
    function getRootHostContext(_rootContainerInstance: any): null;
    function getChildHostContext(_parentHostContext: any, _type: any, _rootContainerInstance: any): null;
    function shouldSetTextContent(_type: any, _props: any): boolean;
    function createTextInstance(_text: any, _rootContainerInstance: any, _hostContext: any, _internalInstanceHandle: any): never;
    function createInstance(type: any, propsWithChildren: any, _container: any, _hostContext: any, _internalInstanceHandle: any): {
        type: any;
        props: any;
        children: never[];
    };
    function appendInitialChild(parentInstance: any, child: any): void;
    function finalizeInitialChildren(parentInstance: any, _type: any, _props: any, _rootContainerInstance: any, _hostContext: any): boolean;
    function commitMount(): void;
    function prepareForCommit(_container: any): null;
    function resetAfterCommit(container: any): void;
    function getPublicInstance(node: any): any;
    function commitTextUpdate(_textInstance: any, _oldText: any, _newText: any): void;
    function clearContainer(_container: any): void;
    function prepareUpdate(_instance: any, _type: any, oldProps: any, newProps: any, container: any, _hostContext: any): any;
    function preparePortalMount(): void;
    function cloneInstance(instance: any, _updatePayload: any, _type: any, _oldProps: any, newProps: any, _internalInstanceHandle: any, keepChildren: any, _recyclableInstance: any): {
        type: any;
        props: any;
        children: any[];
    };
    function createContainerChildSet(): never[];
    function appendChildToContainerChildSet(childSet: any, child: any): void;
    function finalizeContainerChildren(container: any, newChildren: any): void;
    function replaceContainerChildren(container: any, newChildren: any): void;
    function cloneHiddenInstance(_instance: any, _type: any, _props: any): never;
    function cloneHiddenTextInstance(_instance: any, _text: any): never;
    function getCurrentEventPriority(): number;
    function beforeActiveInstanceBlur(): void;
    function afterActiveInstanceBlur(): void;
    function detachDeletedInstance(_node: any): void;
    function getInstanceFromNode(_node: any): never;
    function prepareScopeUpdate(_scopeInstance: any, _instance: any): never;
    function getInstanceFromScope(_scopeInstance: any): never;
}
