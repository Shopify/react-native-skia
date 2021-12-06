import React, { useCallback, useMemo } from "react";

import type { DrawingContext } from "../DrawingContext";
import type { SkNode } from "../Host";
import { NodeType, processChildren } from "../Host";
import type { SkJSIInstane } from "../../skia/JsiInstance";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize, isAnimated } from "../processors/Animations/Animations";

export type DeclarationResult = SkJSIInstane<string> | null;

type UseDeclarationCallback<T> = (
  props: T,
  children: DeclarationResult[],
  ctx: DrawingContext
) => DeclarationResult;

type DeclarationCallback = (
  ctx: DrawingContext,
  children: DeclarationResult[]
) => DeclarationResult;

export const useDeclaration = <T extends React.ReactNode>(
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

export const DeclarationNode = (
  props: DeclarationProps
): SkNode<NodeType.Declaration> => ({
  type: NodeType.Declaration,
  props,
  draw: (ctx, { declaration: { onDeclare } }, unProcessedChildren) => {
    const children = processChildren(ctx, unProcessedChildren);
    const obj = onDeclare(ctx, children);
    return obj;
  },
  children: [],
  memoizable: !props.declaration.isAnimated,
});
