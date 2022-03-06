import { useCallback, useMemo } from "react";

import type { DrawingContext } from "../DrawingContext";
import { SkNode, NodeType } from "../Host";
import type { SkJSIInstance } from "../../skia/JsiInstance";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize, isAnimated } from "../processors/Animations/Animations";
import { rect } from "../processors/Rects";

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
) => {
  const onDeclare = useCallback<DeclarationCallback>(
    (ctx, children) => {
      const materializedProps = materialize(ctx, props);
      return cb(materializedProps, children, ctx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );
  return useMemo(
    () => ({ onDeclare, isAnimated: isAnimated(props) }),
    [onDeclare, props]
  );
};

export interface DeclarationProps {
  declaration: {
    onDeclare: DeclarationCallback;
    isAnimated: boolean;
  };
}

export class DeclarationNode extends SkNode<NodeType.Declaration> {
  constructor(props: DeclarationProps) {
    super(NodeType.Declaration, props);
    this.memoizable = !props.declaration.isAnimated;
  }

  draw(ctx: DrawingContext) {
    const { onDeclare } = this.props.declaration;
    const children = this.visit(ctx);
    const obj = onDeclare(ctx, children);
    return obj;
  }

  bounds() {
    return rect(0, 0, 0, 0);
  }
}
