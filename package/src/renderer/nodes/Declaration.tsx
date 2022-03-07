import { useCallback } from "react";

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
  children: DeclarationResult[]
) => DeclarationResult;

export const useDeclaration = <T,>(
  props: AnimatedProps<T>,
  cb: UseDeclarationCallback<T>
) =>
  useCallback<DeclarationCallback>(
    (ctx, children) => {
      const materializedProps = materialize(props);
      return cb(materializedProps, children, ctx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );

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
    const obj = onDeclare(ctx, children);
    return obj;
  }
}
