import type { SkCanvas, Skia, SkPaint } from "../../skia/types";
export enum NodeType {
  Group,
  Paint,
  Circle,
  Fill,
  Shader,
  ImageShader,
}

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
}

export abstract class Node<P> {
  constructor(public type: NodeType, protected props: P) {}

  setProps(props: P) {
    this.props = props;
  }
}

export abstract class RenderNode<P> extends Node<P> {
  constructor(public type: NodeType, protected props: P) {
    super(type, props);
  }

  abstract render(ctx: DrawingContext): void;
}

export type Invalidate = () => void;

export abstract class DeclarationNode<P, T> extends Node<P> {
  private invalidate: Invalidate | null = null;

  constructor(type: NodeType, props: P) {
    super(type, props);
  }

  abstract get(): T;

  setInvalidate(invalidate: Invalidate) {
    this.invalidate = invalidate;
  }

  setProps(props: P) {
    if (!this.invalidate) {
      throw new Error(
        "Setting props on a declaration not attached to a drawing"
      );
    }
    this.props = props;
    this.invalidate();
  }
}
