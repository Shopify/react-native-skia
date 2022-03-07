import type { DrawingContext } from "../DrawingContext";
import { SkNode, NodeType } from "../Host";
import type { SkJSIInstance } from "../../skia/JsiInstance";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { isAnimated, materialize } from "../processors/Animations/Animations";

export type DeclarationResult = SkJSIInstance<string> | null;

type DeclarationCallback<T> = (
  props: T,
  children: DeclarationResult[],
  ctx: DrawingContext
) => DeclarationResult;

export const createDeclaration = <T,>(
  cb: DeclarationCallback<T>
): DeclarationCallback<T> => cb;

export type DeclarationProps<T> = {
  onDeclare: DeclarationCallback<T>;
};

export class DeclarationNode<T> extends SkNode<NodeType.Declaration> {
  constructor(props: DeclarationProps<T>) {
    super(NodeType.Declaration, props);
    this.props = props;
  }

  set props(props: DeclarationProps<T>) {
    this.memoizable = !isAnimated(props);
    this._props = props;
  }

  get props() {
    return this._props;
  }

  draw(ctx: DrawingContext) {
    const children = this.visit(ctx);
    const { onDeclare, ...newProps } = this.props;
    const props = materialize(newProps as AnimatedProps<T>);
    const obj = onDeclare(props, children, ctx);
    return obj;
  }
}
