import { DependencyManager } from "../DependencyManager";
import { Node } from "../nodes";
import type { NodeProps } from "../nodes";
import type { SkJSIInstance } from "../../skia";
import type { DrawingContext } from "../DrawingContext";
import { Selector } from "../../values";
import { RNSkValue } from "../../values/web/RNSkValue";

class TestNode<P extends NodeProps<P>> extends Node<P> {
  draw(_ctx: DrawingContext): void | (SkJSIInstance<string> | null) {}
}

describe("DependencyManager", () => {
  it("should resolve all properties for a node", () => {
    const mgr = new DependencyManager(() => () => {});
    const node = new TestNode(mgr, { a: 100, b: "hello", c: { d: "world" } });
    expect(node.props.a).toBe(100);
    expect(node.props.b).toBe("hello");
    expect(node.props.c).toEqual({ d: "world" });
    expect(Object.keys(node.props)).toEqual(["a", "b", "c"]);
  });
  it("should remove listeners on a node when node is removed", () => {
    const mgr = new DependencyManager(() => () => {});
    const value = new RNSkValue(100);
    const node = new TestNode(mgr, { a: value });
    expect(mgr.nodeSubscriptionInfos.has(node)).toBe(true);
    node.removeNode();
    expect(mgr.nodeSubscriptionInfos.has(node)).toBe(false);
  });
  it("should resolve a value property to the value's current", () => {
    const value = new RNSkValue(100);
    const mgr = new DependencyManager(() => () => {});
    const node = new TestNode(mgr, { a: value });
    expect(node.props.a).toBe(100);
  });
  it("should resolve a selector property to the selectors value", () => {
    const value = new RNSkValue([100]);
    const mgr = new DependencyManager(() => () => {});
    const node = new TestNode(mgr, { a: Selector(value, (v) => v[0]) });
    expect(node.props.a).toBe(100);
  });
  it("should register a listener on SkiaValues", () => {
    const value = new RNSkValue(100);
    const mockRegister = jest.fn();
    const mgr = new DependencyManager(mockRegister);
    const node = new TestNode(mgr, { a: value });
    mgr.update();
    expect(node.props.a).toBe(100);
    expect(mockRegister).toBeCalled();
  });
  it("should unregister the listener when mgr is updated for the second time", () => {
    const value = new RNSkValue(100);
    const mockUnregister = jest.fn();
    const mockRegister = jest.fn(() => mockUnregister);
    const mgr = new DependencyManager(mockRegister);
    const node = new TestNode(mgr, { a: value });
    mgr.update();
    mgr.update();
    expect(node.props.a).toBe(100);
    expect(mockRegister).toBeCalledTimes(2);
    expect(mockUnregister).toBeCalledTimes(1);
  });
  it("should register a listener on the value", () => {
    const value = new RNSkValue(100);
    const mockRegister = jest.fn();
    const mgr = new DependencyManager(mockRegister);
    const node = new TestNode(mgr, { a: value });
    expect(node.props.a).toBe(100);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(value._listeners.length).toBe(1);
  });
  it("should unregister the listener on the value when node is removed", () => {
    const value = new RNSkValue(100);
    const mockRegister = jest.fn();
    const mgr = new DependencyManager(mockRegister);
    const node = new TestNode(mgr, { a: value });
    expect(node.props.a).toBe(100);
    node.removeNode();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(value._listeners.length).toBe(0);
  });
});
