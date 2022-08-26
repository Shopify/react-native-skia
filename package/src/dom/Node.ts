import type { SkCanvas, Skia, SkPaint } from "../skia/types";
export enum NodeType {
  Group,
  Paint,
  Circle,
  Shader,
}

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
}

export abstract class Node<P> {
  constructor(public type: NodeType, protected props: P) {}
}

export abstract class RenderNode<P> extends Node<P> {
  constructor(public type: NodeType, protected props: P) {
    super(type, props);
  }

  abstract render(ctx: DrawingContext): void;
}
