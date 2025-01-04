import { NodeType } from "../../dom/types";

export interface Node<Props = unknown> {
  type: NodeType;
  isDeclaration: boolean;
  props: Props;
  children: Node[];
}

// TODO: Remove
export const sortNodes = (children: Node[]) => {
  "worklet";
  const declarations: Node[] = [];
  const drawings: Node[] = [];

  children.forEach((node) => {
    if (node.isDeclaration) {
      declarations.push(node);
    } else {
      drawings.push(node);
    }
  });

  return { declarations, drawings };
};

export const sortNodeChildren = (parent: Node) => {
  "worklet";
  const maskFilters: Node[] = [];
  const colorFilters: Node[] = [];
  const drawings: Node[] = [];
  const declarations: Node[] = [];
  parent.children.forEach((node) => {
    if (
      node.type === NodeType.BlendColorFilter ||
      node.type === NodeType.MatrixColorFilter ||
      node.type === NodeType.LerpColorFilter ||
      node.type === NodeType.LumaColorFilter ||
      node.type === NodeType.SRGBToLinearGammaColorFilter ||
      node.type === NodeType.LinearToSRGBGammaColorFilter
    ) {
      colorFilters.push(node);
    } else if (node.type === NodeType.BlurMaskFilter) {
      maskFilters.push(node);
    } else if (node.isDeclaration) {
      declarations.push(node);
    } else {
      drawings.push(node);
    }
  });
  return { colorFilters, drawings, declarations, maskFilters };
};
