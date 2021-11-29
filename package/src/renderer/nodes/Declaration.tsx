import { useCallback } from "react";

import type { DrawingContext } from "../DrawingContext";
import type { SkNode } from "../Host";
import { NodeType, processChildren } from "../Host";
import type { SkJSIInstane } from "../../skia/JsiInstance";

export type DeclarationResult = SkJSIInstane<string> | null;

type DeclarationCallback = (
  ctx: DrawingContext,
  children: DeclarationResult[]
) => DeclarationResult;

export const useDeclaration = (
  cb: DeclarationCallback,
  deps: Parameters<typeof useCallback>[1]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useCallback(cb, deps);

export interface DeclarationProps {
  onDeclare: DeclarationCallback;
}

export const DeclarationNode = (
  props: DeclarationProps
): SkNode<NodeType.Declaration> => ({
  type: NodeType.Declaration,
  props,
  draw: (ctx, { onDeclare }, unProcessedChildren) => {
    const children = processChildren(ctx, unProcessedChildren);
    const obj = onDeclare(ctx, children);
    return obj;
  },
  children: [],
  // TODO: set to false if we animate the paint
  memoizable: false,
});
