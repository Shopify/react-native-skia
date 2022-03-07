import type { DrawingContext } from "../DrawingContext";
import { SkNode, NodeType } from "../Host";
import type { SkJSIInstance } from "../../skia/JsiInstance";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize, isAnimated } from "../processors/Animations/Animations";

export type DeclarationResult = SkJSIInstance<string> | null;

type UseDeclarationCallback<T> = (
  props: T,
  children: DeclarationResult[],
  ctx: DrawingContext
) => DeclarationResult;

type DeclarationCallback = (
  ctx: DrawingContext,
  node: SkNode,
  children: DeclarationResult[]
) => DeclarationResult;

export const createDeclaration =
  <T,>(cb: UseDeclarationCallback<T>): DeclarationCallback =>
  (ctx, node, children) => {
    const materializedProps = materialize(node.props as AnimatedProps<T>);
    return cb(materializedProps, children, ctx);
  };

export interface DeclarationProps {
  onDeclare: DeclarationCallback;
}

export class DeclarationNode extends SkNode<NodeType.Declaration> {
  constructor(props: DeclarationProps) {
    super(NodeType.Declaration, props);
    this.props = props;
  }

  set props(props: DeclarationProps) {
    this.memoizable = !isAnimated(props);
    this._props = props;
  }

  get props() {
    return this._props;
  }

  draw(ctx: DrawingContext) {
    const { onDeclare } = this.props;
    const children = this.visit(ctx);
    const obj = onDeclare(ctx, this, children);
    return obj;
  }
}
